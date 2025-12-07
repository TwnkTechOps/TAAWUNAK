import {Injectable} from '@nestjs/common';

@Injectable()
export class VerificationService {
  async checkDomain(domain: string) {
    const d = (domain || '').toLowerCase().trim();
    const verified = d.endsWith('.edu.sa') || d.endsWith('.gov.sa') || d.includes('.edu.');
    return {domain: d, status: verified ? 'VERIFIED' : 'PENDING'};
  }

  async startPassport(input: {passportNumber: string; name: string; country: string}) {
    return {requestId: `passport-${Date.now()}`, status: 'PENDING', echo: input};
  }

  async passportStatus(requestId: string) {
    const approved = requestId.startsWith('passport-');
    return {requestId, status: approved ? 'APPROVED' : 'PENDING'};
  }

  async startNafath(nationalId: string) {
    return {requestId: `nafath-${Date.now()}`, status: 'PENDING', nationalId};
  }

  async nafathStatus(requestId: string) {
    return {requestId, status: 'APPROVED'};
  }
}


