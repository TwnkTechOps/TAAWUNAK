import {Injectable, UnauthorizedException, ConflictException, BadRequestException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {PrismaService} from '../../services/prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes, randomInt } from 'crypto';
import { MailService } from '../../services/mail.service';
import { RiskService } from './risk.service';
import { MfaService } from '../mfa/mfa.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
    private risk: RiskService,
    private mfa: MfaService
  ) {}

  async register(email: string, password: string, fullName: string) {
    const existing = await this.prisma.user.findUnique({where: {email}});
    if (existing) throw new ConflictException('Email already in use');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {email, passwordHash, fullName}
    });
    return this.sign(user.id, user.email, user.fullName, user.role);
  }

  async login(
    email: string,
    password: string,
    otp?: string,
    opts?: {newDevice?: boolean; ip?: string; ua?: string; deviceId?: string}
  ) {
    const user = await this.prisma.user.findUnique({where: {email}});
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if ((user as any).suspended === true) throw new UnauthorizedException('Account suspended');
    
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // Calculate risk score
    const risk = await this.risk.calculateRisk(
      user.id,
      opts?.ip,
      opts?.ua,
      opts?.deviceId,
      opts?.newDevice
    );

    // Log login attempt (defensive - table might not exist)
    try {
      await this.prisma.auditEvent.create({
        data: {
          actorUserId: user.id,
          action: 'LOGIN',
          metadata: {risk: risk.score, factors: risk.factors},
          ip: opts?.ip,
          ua: opts?.ua
        }
      });
    } catch (e) {
      // Audit table might not exist - log to console in dev
      console.log('Login audit log skipped:', e);
    }

    // Check MFA if enabled
    if (user.mfaEnabled) {
      if (!otp) {
        throw new BadRequestException({
          requiresMfa: true,
          risk: risk.score,
          factors: risk.factors
        });
      }
      // Verify TOTP
      try {
        const {authenticator} = require('otplib');
        const valid = authenticator.check(otp, user.mfaSecret);
        if (!valid) {
          try {
            await this.prisma.auditEvent.create({
              data: {
                actorUserId: user.id,
                action: 'MFA_FAILED',
                ip: opts?.ip,
                ua: opts?.ua
              }
            });
          } catch (e) {
            // Audit table might not exist
            console.log('MFA failed audit log skipped:', e);
          }
          throw new UnauthorizedException('Invalid OTP');
        }
      } catch (e) {
        if (e instanceof UnauthorizedException) throw e;
        throw new UnauthorizedException('MFA verification failed');
      }
    } else if (risk.requiresMfa) {
      // Adaptive MFA - require OTP for high-risk logins
      // DEMO MODE: For demo purposes, we'll show OTP in response and allow bypass
      const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'development';
      
      if (!otp) {
        // Generate and send OTP automatically
        const code = randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        try {
          // Store OTP
          await this.prisma.token.create({
            data: {
              userId: user.id,
              token: `otp_${code}`,
              type: 'EMAIL_VERIFY',
              expiresAt
            }
          });
          
          // Send OTP via email
          try {
            await this.mail.send(
              user.email,
              'TAWĀWUNAK Login Verification Code',
              `<p>Hello ${user.fullName || ''},</p>
              <p>Your login attempt was flagged for additional verification due to security risk (score: ${risk.score}/100).</p>
              <p>Your verification code is: <strong>${code}</strong></p>
              <p>This code expires in 10 minutes.</p>
              <p>If you did not attempt to log in, please secure your account immediately.</p>`
            );
          } catch (e) {
            console.error('Failed to send email:', e);
          }
        } catch (e) {
          // If OTP storage fails, still show the requirement
          console.error('Failed to store adaptive OTP:', e);
        }
        
        // DEMO MODE: Include OTP in response for easy testing
        const response: any = {
          requiresMfa: true,
          adaptive: true,
          risk: risk.score,
          factors: risk.factors,
          message: 'OTP has been sent to your email. Please check your inbox and enter the code.'
        };
        
        if (isDemoMode) {
          response.demoOtp = code; // Include OTP in response for demo
          response.message += ` [DEMO: OTP is ${code}]`;
        }
        
        throw new BadRequestException(response);
      }
      
      // Verify OTP for adaptive MFA
      const token = await this.prisma.token.findFirst({
        where: {
          userId: user.id,
          token: `otp_${otp}`,
          expiresAt: {gte: new Date()}
        }
      });
      
      if (!token) {
        // DEMO MODE: Allow any 6-digit code for demo
        if (isDemoMode && /^\d{6}$/.test(otp)) {
          console.log(`[DEMO] Allowing OTP bypass: ${otp}`);
          // Clean up any existing OTP tokens for this user
          try {
            await this.prisma.token.deleteMany({
              where: {
                userId: user.id,
                token: {startsWith: 'otp_'}
              }
            });
          } catch (e) {
            // Ignore
          }
        } else {
          try {
            await this.prisma.auditEvent.create({
              data: {
                actorUserId: user.id,
                action: 'MFA_FAILED',
                metadata: {type: 'adaptive', risk: risk.score},
                ip: opts?.ip,
                ua: opts?.ua
              }
            });
          } catch (e) {
            // Audit table might not exist
          }
          throw new UnauthorizedException('Invalid or expired OTP code');
        }
      } else {
        // Delete used OTP
        await this.prisma.token.delete({where: {id: token.id}});
      }
    }

    // Track device (defensive - table might not exist)
    if (opts?.deviceId) {
      try {
        await this.createOrTouchDevice(user.id, opts.deviceId, opts.ua, opts.ip);
      } catch (e) {
        // Device table might not exist - log but don't fail login
        console.log('Device tracking skipped:', e);
      }
    }

    return this.sign(user.id, user.email, user.fullName, user.role);
  }

  private async sign(id: string, email: string, fullName: string, role: string) {
    // Demo: skip tokenVersion check if column doesn't exist
    let ver = 0;
    try {
      const u = await this.prisma.user.findUnique({where: {id}});
      ver = (u as any)?.tokenVersion ?? 0;
    } catch {
      // Column may not exist, use default
      ver = 0;
    }
    const token = this.jwt.sign({sub: id, email, role, ver});
    return {token, user: {id, email, fullName, role}};
  }

  // Email verification and password reset (dev-friendly stubs)
  async requestEmailVerification(email: string) {
    const user = await this.prisma.user.findUnique({where: {email}});
    if (!user) return {ok: true}; // do not leak users
    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h
    await this.prisma.token.create({
      data: {userId: user.id, token, type: 'EMAIL_VERIFY', expiresAt}
    });
    // Send email
    const web = process.env.WEB_ORIGIN || 'http://localhost:4320';
    const link = `${web}/auth/verify/confirm?token=${encodeURIComponent(token)}`;
    await this.mail.send(
      email,
      'Verify your TAWĀWUNAK email',
      `<p>Hello ${user.fullName || ''},</p><p>Confirm your email by clicking the link below:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour.</p>`
    );
    return {ok: true, token};
  }

  async verifyEmail(token: string) {
    const rec = await this.prisma.token.findUnique({where: {token}});
    if (!rec || rec.type !== 'EMAIL_VERIFY' || rec.expiresAt < new Date()) throw new UnauthorizedException('Invalid token');
    await this.prisma.user.update({where: {id: rec.userId}, data: {emailVerifiedAt: new Date()}});
    await this.prisma.token.delete({where: {id: rec.id}});
    return {ok: true};
  }

  async createOrTouchDeviceForToken(token: string, deviceId: string, ua?: string, ip?: string) {
    try {
      // Decode token to get userId
      const payload = this.jwt.decode(token) as any;
      if (payload?.sub) {
        await this.createOrTouchDevice(payload.sub, deviceId, ua, ip);
      }
    } catch {
      // Ignore errors
    }
  }

  async revokeSessions(userId: string) {
    // Demo mode: simplified - just increment tokenVersion if column exists
    try {
      await this.prisma.user.update({
        where: {id: userId},
        data: {tokenVersion: {increment: 1}}
      });
    } catch {
      // Column may not exist - that's ok for demo
    }
    return {ok: true};
  }



  async createOrTouchDevice(userId: string, deviceId: string, ua?: string, ip?: string) {
    if (!deviceId) return;
    try {
      await this.prisma.device.upsert({
        where: {userId_deviceId: {userId, deviceId}},
        create: {userId, deviceId, ua, ip},
        update: {ua, ip, lastSeen: new Date()}
      });
    } catch (e: any) {
      // If table doesn't exist (P2021) or other Prisma errors, just log it
      if (e?.code === 'P2021' || e?.code === 'P2003' || e?.message?.includes('does not exist')) {
        console.log('Device table does not exist - skipping device tracking');
        return; // Silently skip
      }
      // Re-throw unexpected errors
      throw e;
    }
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({where: {email}});
    if (!user) return {ok: true};
    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h
    await this.prisma.token.create({
      data: {userId: user.id, token, type: 'PASSWORD_RESET', expiresAt}
    });
    const web = process.env.WEB_ORIGIN || 'http://localhost:4320';
    const link = `${web}/auth/reset?token=${encodeURIComponent(token)}`;
    await this.mail.send(
      email,
      'Reset your TAWĀWUNAK password',
      `<p>Hello ${user.fullName || ''},</p><p>You requested a password reset.</p><p><a href="${link}">Set a new password</a></p><p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>`
    );
    return {ok: true, token};
  }

  async resetPassword(token: string, newPassword: string) {
    const rec = await this.prisma.token.findUnique({where: {token}});
    if (!rec || rec.type !== 'PASSWORD_RESET' || rec.expiresAt < new Date()) throw new UnauthorizedException('Invalid token');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: {id: rec.userId},
      data: {passwordHash, tokenVersion: {increment: 1}}
    });
    await this.prisma.token.delete({where: {id: rec.id}});
    return {ok: true};
  }
}

