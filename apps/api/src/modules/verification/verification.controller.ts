import {Body, Controller, Post} from '@nestjs/common';
import {VerificationService} from './verification.service';

@Controller('verification')
export class VerificationController {
  constructor(private svc: VerificationService) {}

  @Post('domain/check')
  async domainCheck(@Body() body: {domain: string}) {
    return this.svc.checkDomain(body.domain);
    }

  @Post('passport/start')
  async passportStart(@Body() body: {passportNumber: string; name: string; country: string}) {
    return this.svc.startPassport(body);
  }

  @Post('passport/status')
  async passportStatus(@Body() body: {requestId: string}) {
    return this.svc.passportStatus(body.requestId);
  }

  @Post('nafath/start')
  async nafathStart(@Body() body: {nationalId: string}) {
    return this.svc.startNafath(body.nationalId);
  }

  @Post('nafath/status')
  async nafathStatus(@Body() body: {requestId: string}) {
    return this.svc.nafathStatus(body.requestId);
  }
}


