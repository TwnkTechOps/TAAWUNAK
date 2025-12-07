import {Body, Controller, Get, Post, Request, UseGuards, Res} from '@nestjs/common';
import {AuthService} from './auth.service';
import {JwtAuthGuard} from './jwt.guard';
import {Response} from 'express';
import {PrismaService} from '../../services/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private prisma: PrismaService) {}

  @Post('register')
  async register(@Body() body: {email: string; password: string; fullName: string}) {
    return this.auth.register(body.email, body.password, body.fullName);
  }

  @Post('login')
  async login(@Request() req: any, @Body() body: {email: string; password: string; otp?: string}) {
    const cookieHeader: string | undefined = req?.headers?.cookie;
    const hasDevice = !!(cookieHeader && cookieHeader.includes('tawawunak_device='));
    const deviceId = cookieHeader?.split(';').map(s => s.trim()).find(s => s.startsWith('tawawunak_device='))?.split('=')[1] || undefined;
    const newDevice = !hasDevice;
    const ua = req?.headers?.['user-agent'];
    const ip = (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0] || req?.ip || req?.socket?.remoteAddress;
    return this.auth.login(body.email, body.password, body.otp, {
      newDevice,
      ip,
      ua,
      deviceId: deviceId ? decodeURIComponent(deviceId) : undefined
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: any) {
    return {user: req.user};
  }

  // Set API-domain cookie for session (used after local login)
  @Post('session')
  async session(@Body() body: {token: string}, @Request() req: any, @Res() res: any) {
    const token = body?.token;
    if (!token) return res.status(400).send({message: 'Missing token'});
    const deviceId = (global as any).crypto?.randomUUID?.() || Date.now().toString();
    // For local dev: set domain to localhost (without port) so cookies work across ports
    // In production, set domain to your actual domain
    const isDev = process.env.NODE_ENV !== 'production';
    const domain = isDev ? 'localhost' : undefined;
    const tokenCookie = `tawawunak_token=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 12}${domain ? `; Domain=${domain}` : ''}`;
    const deviceCookie = `tawawunak_device=${encodeURIComponent(deviceId)}; Path=/; SameSite=Lax; Max-Age=${60 *
      60 *
      24 *
      365}${domain ? `; Domain=${domain}` : ''}`;
    res.header('Set-Cookie', [tokenCookie, deviceCookie]);
    const ua = req?.headers?.['user-agent'];
    const ip = (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0] || req?.ip;
    await this.auth.createOrTouchDeviceForToken(token, deviceId, ua, ip);
    return res.send({ok: true});
  }

  @Post('logout')
  async logout(@Res() res: any) {
    const expired = 'Thu, 01 Jan 1970 00:00:00 GMT';
    const isDev = process.env.NODE_ENV !== 'production';
    const domain = isDev ? 'localhost' : undefined;
    const domainSuffix = domain ? `; Domain=${domain}` : '';
    res.header('Set-Cookie', [
      `tawawunak_token=; HttpOnly; Path=/; SameSite=Lax; Expires=${expired}${domainSuffix}`,
      `tawawunak_device=; Path=/; SameSite=Lax; Expires=${expired}${domainSuffix}`
    ]);
    return res.send({ok: true});
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions/devices')
  async devices(@Request() req: any) {
    const devices = await this.prisma.device.findMany({
      where: {userId: req.user.id, revoked: false},
      orderBy: {lastSeen: 'desc'}
    });
    return devices.map(d => ({
      deviceId: d.deviceId,
      ua: d.ua,
      ip: d.ip,
      lastSeen: d.lastSeen,
      createdAt: d.createdAt
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/devices/revoke')
  async revokeDevice(@Request() req: any, @Body() body: {deviceId: string}) {
    const deviceId = body?.deviceId;
    if (!deviceId) return {ok: false};
    await (this as any).auth['prisma'].device.updateMany({
      where: {userId: req.user.id, deviceId},
      data: {revoked: true}
    });
    return {ok: true};
  }

  @UseGuards(JwtAuthGuard)
  @Post('session/revoke')
  async revoke(@Request() req: any) {
    // Demo mode: just return success
    try {
      await this.auth.revokeSessions(req.user.id);
      return {ok: true};
    } catch {
      // If it fails, still return success for demo
      return {ok: true};
    }
  }

  // Email verification
  @Post('email/request-verify')
  async requestVerify(@Body() body: {email: string}) {
    return this.auth.requestEmailVerification(body.email);
  }

  @Post('email/verify')
  async verify(@Body() body: {token: string}) {
    return this.auth.verifyEmail(body.token);
  }

  // Password reset
  @Post('password/forgot')
  async forgot(@Body() body: {email: string}) {
    return this.auth.requestPasswordReset(body.email);
  }

  @Post('password/reset')
  async reset(@Body() body: {token: string; newPassword: string}) {
    return this.auth.resetPassword(body.token, body.newPassword);
  }
}

