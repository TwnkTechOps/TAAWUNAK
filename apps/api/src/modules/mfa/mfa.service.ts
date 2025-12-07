import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PrismaService} from '../../services/prisma.service';

@Injectable()
export class MfaService {
  constructor(private prisma: PrismaService) {}

  async enroll(userId: string, issuer = 'TAWAWUNAK') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {authenticator} = require('otplib');
    const secret = authenticator.generateSecret();
    const user = await this.prisma.user.update({
      where: {id: userId},
      data: {mfaSecret: secret, mfaEnabled: false}
    });
    const otpauth = authenticator.keyuri(user.email, issuer, secret);
    return {otpauthUrl: otpauth, secretMasked: secret.slice(0, 4) + '****'};
  }

  async verify(userId: string, token: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {authenticator} = require('otplib');
    const user = await this.prisma.user.findUnique({where: {id: userId}});
    if (!user?.mfaSecret) throw new UnauthorizedException('No pending enrollment');
    const valid = authenticator.check(token, user.mfaSecret);
    if (!valid) throw new UnauthorizedException('Invalid token');
    await this.prisma.user.update({where: {id: userId}, data: {mfaEnabled: true}});
    return {enabled: true};
  }

  async disable(userId: string, token: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {authenticator} = require('otplib');
    const user = await this.prisma.user.findUnique({where: {id: userId}});
    if (!user?.mfaSecret) return {enabled: false};
    const valid = authenticator.check(token, user.mfaSecret);
    if (!valid) throw new UnauthorizedException('Invalid token');
    await this.prisma.user.update({where: {id: userId}, data: {mfaEnabled: false, mfaSecret: null}});
    return {enabled: false};
  }
}

