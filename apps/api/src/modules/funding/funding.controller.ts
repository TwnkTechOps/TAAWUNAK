import {Body, Controller, Get, Post, Patch, Param, Request, UseGuards} from '@nestjs/common';
import {FundingService} from './funding.service';
import {JwtAuthGuard} from '../auth/jwt.guard';

@Controller('funding')
@UseGuards(JwtAuthGuard)
export class FundingController {
  constructor(private readonly svc: FundingService) {}

  @Get('calls')
  async listCalls(@Request() req: any) {
    return this.svc.listCalls(req.user?.id, req.user?.role);
  }

  @Get('calls/:id')
  async getCall(@Param('id') id: string) {
    return this.svc.getCall(id);
  }

  @Post('calls')
  async createCall(
    @Body() body: {title: string; description: string; deadline: string},
    @Request() req: any
  ) {
    return this.svc.createCall(req.user.id, req.user.role, {
      ...body,
      deadline: new Date(body.deadline)
    });
  }

  @Post('applications')
  async submitApplication(
    @Body() body: {fundingCallId: string; projectId: string},
    @Request() req: any
  ) {
    return this.svc.submitApplication(body.fundingCallId, body.projectId, req.user.id);
  }

  @Patch('applications/:id/status')
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() body: {status: string},
    @Request() req: any
  ) {
    return this.svc.updateApplicationStatus(id, req.user.id, req.user.role, body.status);
  }
}

