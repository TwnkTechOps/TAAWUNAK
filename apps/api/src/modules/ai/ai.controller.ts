import {Controller, Post, Param, Request, UseGuards} from '@nestjs/common';
import {AiService} from './ai.service';
import {JwtAuthGuard} from '../auth/jwt.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly svc: AiService) {}

  @Post('proposals/:id/evaluate')
  async evaluateProposal(@Param('id') proposalId: string, @Request() req: any) {
    return this.svc.evaluateProposal(proposalId);
  }

  @Post('projects/:id/risks')
  async detectRisks(@Param('id') projectId: string, @Request() req: any) {
    return this.svc.detectRisks(projectId);
  }
}

