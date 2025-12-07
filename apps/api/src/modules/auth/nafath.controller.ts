import {Body, Controller, Post} from '@nestjs/common';

@Controller('auth/nafath')
export class NafathController {
  @Post('start')
  start(@Body() body: {nationalId: string}) {
    // Stub for MVP - would call Nafath APIs
    const requestId = `nafath-${Date.now()}`;
    return {requestId, status: 'PENDING'};
  }

  @Post('status')
  status(@Body() body: {requestId: string}) {
    // Always succeeds after a short delay in dev
    return {requestId: body.requestId, status: 'APPROVED'};
  }
}


