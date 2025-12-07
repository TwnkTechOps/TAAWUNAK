import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../services/prisma.service';
import {MailService} from '../../services/mail.service';
import {randomInt} from 'crypto';

@Injectable()
export class OtpService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService
  ) {}

  async generateOtp(userId: string, method: 'email' | 'sms' = 'email'): Promise<string> {
    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP (in production, use Redis with TTL)
    await this.prisma.token.create({
      data: {
        userId,
        token: `otp_${code}`,
        type: method === 'email' ? 'EMAIL_VERIFY' : 'PASSWORD_RESET', // Reuse enum
        expiresAt
      }
    });

    const user = await this.prisma.user.findUnique({where: {id: userId}});
    if (!user) throw new Error('User not found');

    if (method === 'email') {
      await this.mail.send(
        user.email,
        'Your TAWĀWUNAK OTP Code',
        `<p>Hello ${user.fullName || ''},</p><p>Your OTP code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`
      );
    } else {
      // SMS would go here - integrate with SMS provider
      // For now, log it
      console.log(`SMS OTP for ${user.email}: ${code}`);
    }

    return code;
  }

  async verifyOtp(userId: string, code: string): Promise<boolean> {
    const token = await this.prisma.token.findFirst({
      where: {
        userId,
        token: `otp_${code}`,
        expiresAt: {gte: new Date()}
      }
    });

    if (!token) return false;

    // Delete used OTP
    await this.prisma.token.delete({where: {id: token.id}});
    return true;
  }
}

