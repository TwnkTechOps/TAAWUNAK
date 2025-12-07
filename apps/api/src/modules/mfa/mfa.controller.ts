import {Body, Controller, Post, Request, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/jwt.guard';
import {MfaService} from './mfa.service';
import {OtpService} from './otp.service';

@Controller('mfa')
export class MfaController {
  constructor(
    private svc: MfaService,
    private otp: OtpService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('enroll')
  enroll(@Request() req: any) {
    const issuer = process.env.MFA_ISSUER || 'TAWAWUNAK';
    return this.svc.enroll(req.user.id, issuer);
    }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  verify(@Request() req: any, @Body() body: {token: string}) {
    return this.svc.verify(req.user.id, body.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('disable')
  disable(@Request() req: any, @Body() body: {token: string}) {
    return this.svc.disable(req.user.id, body.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('otp/send')
  async sendOtp(@Request() req: any, @Body() body: {method?: 'email' | 'sms'}) {
    const code = await this.otp.generateOtp(req.user.id, body.method || 'email');
    return {ok: true, method: body.method || 'email'};
  }

  @UseGuards(JwtAuthGuard)
  @Post('otp/verify')
  async verifyOtp(@Request() req: any, @Body() body: {code: string}) {
    const valid = await this.otp.verifyOtp(req.user.id, body.code);
    if (!valid) throw new Error('Invalid OTP');
    return {ok: true};
  }
}

