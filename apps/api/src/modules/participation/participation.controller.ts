import { Controller, Get, Post, Put, Delete, Param, Body, Request, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ParticipationService } from './participation.service';

@Controller('participation')
@UseGuards(JwtAuthGuard)
export class ParticipationController {
  constructor(private participationService: ParticipationService) {}

  @Get('quota/:institutionId')
  async getQuota(@Param('institutionId') institutionId: string) {
    return this.participationService.getOrCreateQuota(institutionId);
  }

  @Put('quota/:institutionId')
  async updateQuota(@Param('institutionId') institutionId: string, @Request() req: any, @Body() body: any) {
    return this.participationService.updateQuota(institutionId, req.user.id, body);
  }

  @Get('participants')
  async getParticipants(
    @Query('institutionId') institutionId?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('gender') gender?: string,
    @Query('skillArea') skillArea?: string
  ) {
    return this.participationService.getParticipants({
      institutionId,
      projectId,
      status,
      gender,
      skillArea
    });
  }

  @Post('participants')
  async addParticipant(@Request() req: any, @Body() body: any) {
    return this.participationService.addParticipant(body.institutionId, body.userId, {
      projectId: body.projectId,
      role: body.role,
      skillArea: body.skillArea,
      gender: body.gender
    });
  }

  @Delete('participants/:id')
  async removeParticipant(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.participationService.removeParticipant(id, body.institutionId);
  }

  @Post('invitations')
  async sendInvitation(@Request() req: any, @Body() body: any) {
    return this.participationService.sendInvitation(body.institutionId, req.user.id, {
      invitedInstitutionId: body.invitedInstitutionId,
      projectId: body.projectId,
      skillAreas: body.skillAreas,
      quotaAllocated: body.quotaAllocated,
      message: body.message
    });
  }

  @Put('invitations/:id/respond')
  async respondToInvitation(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.participationService.respondToInvitation(id, body.institutionId, body.response);
  }

  @Get('analytics')
  async getAnalytics(
    @Query('institutionId') institutionId?: string,
    @Query('tier') tier?: string
  ) {
    return this.participationService.getAnalytics({ institutionId, tier });
  }

  @Get('suggestions/:institutionId')
  async getSuggestedProjects(@Param('institutionId') institutionId: string) {
    return this.participationService.getSuggestedProjects(institutionId);
  }

  @Get('ministry/overview')
  async getMinistryOverview(
    @Query('tier') tier?: string,
    @Query('region') region?: string
  ) {
    return this.participationService.getMinistryOverview({ tier, region });
  }

  @Put('ministry/quota/:institutionId')
  async updateMinistryQuota(@Param('institutionId') institutionId: string, @Request() req: any, @Body() body: any) {
    return this.participationService.updateMinistryQuota(institutionId, req.user.id, body);
  }

  @Get('ministry/reports/inclusive')
  async generateInclusiveReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('tier') tier?: string,
    @Query('region') region?: string
  ) {
    return this.participationService.generateInclusiveReport({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      tier,
      region
    });
  }
}

