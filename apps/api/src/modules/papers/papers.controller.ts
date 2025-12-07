import { Controller, Get, Post, Put, Delete, Param, Body, Request, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PapersService } from './papers.service';

@Controller('papers')
@UseGuards(JwtAuthGuard)
export class PapersController {
  constructor(private papersService: PapersService) {}

  @Post()
  async createPaper(@Request() req: any, @Body() body: any) {
    return this.papersService.createPaper(req.user.id, body);
  }

  @Get()
  async getPapers(
    @Request() req: any,
    @Query('institutionId') institutionId?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string
  ) {
    return this.papersService.getPapers(req.user.id, {
      institutionId,
      projectId,
      status,
      search
    });
  }

  @Get(':id')
  async getPaperById(@Param('id') id: string, @Request() req: any) {
    return this.papersService.getPaperById(id, req.user.id);
  }

  @Post(':id/versions')
  async createVersion(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.papersService.createVersion(id, req.user.id, body);
  }

  @Post(':id/submit')
  async submitForReview(@Param('id') id: string, @Request() req: any) {
    return this.papersService.submitForReview(id, req.user.id);
  }

  @Post(':id/institutional-review')
  async institutionalReview(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.papersService.institutionalReview(id, req.user.id, body);
  }

  @Post(':id/reviews')
  async assignPeerReviewer(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.papersService.assignPeerReviewer(id, body.reviewerId, body.reviewType, req.user.id);
  }

  @Put('reviews/:reviewId')
  async submitPeerReview(@Param('reviewId') reviewId: string, @Request() req: any, @Body() body: any) {
    return this.papersService.submitPeerReview(reviewId, req.user.id, body);
  }

  @Post(':id/collaborators')
  async addCollaborator(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.papersService.addCollaborator(id, req.user.id, body.collaboratorId, body.role, body.orcidId);
  }

  @Post(':id/citations')
  async addCitation(@Param('id') id: string, @Body() body: any) {
    return this.papersService.addCitation(id, body.citedPaperId, body.citationType, body.context);
  }

  @Put(':id/metadata')
  async updateMetadata(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.papersService.updateMetadata(id, req.user.id, body);
  }

  @Put(':id/impact')
  async updateImpactMetrics(@Param('id') id: string, @Body() body: any) {
    return this.papersService.updateImpactMetrics(id, body);
  }

  @Post(':id/plagiarism-check')
  async runPlagiarismCheck(@Param('id') id: string, @Request() req: any) {
    return this.papersService.recordPlagiarismCheck(id, 0, {});
  }

  @Put(':id/plagiarism-check')
  async recordPlagiarismCheck(@Param('id') id: string, @Body() body: any) {
    return this.papersService.recordPlagiarismCheck(id, body.score, body.report);
  }

  @Post(':id/share')
  async sharePaper(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.papersService.sharePaper(id, req.user.id, body);
  }

  @Post(':id/archive')
  async archivePaper(@Param('id') id: string, @Request() req: any) {
    return this.papersService.archivePaper(id, req.user.id);
  }
}

