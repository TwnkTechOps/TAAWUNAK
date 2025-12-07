import {Module} from '@nestjs/common';
import {MfaController} from './mfa.controller';
import {MfaService} from './mfa.service';
import {OtpService} from './otp.service';
import {PrismaService} from '../../services/prisma.service';
import {MailService} from '../../services/mail.service';

@Module({
  controllers: [MfaController],
  providers: [MfaService, OtpService, PrismaService, MailService],
  exports: [MfaService, OtpService]
})
export class MfaModule {}

