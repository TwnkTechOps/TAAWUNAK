import {Body, Controller, Get, Post, Patch, Param, Request, UseGuards, Query, Put} from '@nestjs/common';
import {ProposalsService} from './proposals.service';
import {TierClassificationService} from './services/tier-classification.service';
import {MatchingEngineService} from './services/matching-engine.service';
import {ApprovalWorkflowService} from './services/approval-workflow.service';
import {AiService} from '../ai/ai.service';
import {JwtAuthGuard} from '../auth/jwt.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {Role, ProposalTier, ApprovalLevel} from '@prisma/client';

@Controller('proposals')
@UseGuards(JwtAuthGuard)
export class ProposalsController {
  constructor(
    private readonly svc: ProposalsService,
    private readonly tierService: TierClassificationService,
    private readonly matchingService: MatchingEngineService,
    private readonly approvalService: ApprovalWorkflowService,
    private readonly aiService: AiService
  ) {}

  @Get()
  async list(@Request() req: any, @Query('tier') tier?: string, @Query('public') publicOnly?: string) {
    if (tier) {
      return this.tierService.getProposalsByTier(tier as ProposalTier);
    }
    if (publicOnly === 'true') {
      return this.svc.listPublic();
    }
    return this.svc.list(req.user?.id, req.user?.role);
  }

  @Get('tiers/stats')
  async getTierStats() {
    return this.tierService.getTierStatistics();
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Request() req: any) {
    return this.svc.getById(id, req.user?.id, req.user?.role);
  }

  @Get(':id/evaluation')
  async getEvaluation(@Param('id') id: string) {
    return this.svc.getEvaluation(id);
  }

  @Get(':id/matches')
  async getMatches(@Param('id') id: string) {
    return this.matchingService.findMatchesForProposal(id);
  }

  @Get(':id/workflow')
  async getWorkflow(@Param('id') id: string) {
    return this.approvalService.getWorkflowStatus(id);
  }

  @Post()
  async create(
    @Body() body: {projectId: string; content: string; trl: number; strategicAlignment?: string[]},
    @Request() req: any
  ) {
    const proposal = await this.svc.create(body.projectId, req.user.id, {
      content: body.content,
      trl: body.trl,
      strategicAlignment: body.strategicAlignment
    });

    // Initialize approval workflow
    await this.approvalService.initializeWorkflow(proposal.id);

    // Auto-evaluate and classify
    await this.evaluateAndClassify(proposal.id);

    return proposal;
  }

  @Post(':id/evaluate')
  @Roles(Role.ADMIN, Role.INSTITUTION_ADMIN)
  async evaluate(@Param('id') id: string) {
    return this.evaluateAndClassify(id);
  }

  @Post(':id/find-matches')
  @Roles(Role.ADMIN, Role.INSTITUTION_ADMIN)
  async findMatches(@Param('id') id: string) {
    const matches = await this.matchingService.findMatchesForProposal(id);
    await this.matchingService.saveMatches(id, matches);
    return matches;
  }

  @Post(':id/express-interest')
  async expressInterest(
    @Param('id') id: string,
    @Body() body: {interestLevel: string; feedback?: string},
    @Request() req: any
  ) {
    return this.svc.expressInterest(id, req.user.institutionId, body);
  }

  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.INSTITUTION_ADMIN)
  async approve(
    @Param('id') id: string,
    @Body() body: {level: ApprovalLevel; comments?: string},
    @Request() req: any
  ) {
    await this.approvalService.approve(id, body.level, req.user.id, body.comments);
    return {success: true};
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.INSTITUTION_ADMIN)
  async reject(
    @Param('id') id: string,
    @Body() body: {level: ApprovalLevel; comments: string},
    @Request() req: any
  ) {
    await this.approvalService.reject(id, body.level, req.user.id, body.comments);
    return {success: true};
  }

  @Get('enterprise/browse')
  async browseForEnterprise(
    @Query('tier') tier?: string,
    @Query('limit') limit?: string
  ) {
    if (tier) {
      return this.tierService.getProposalsByTier(tier as ProposalTier, limit ? parseInt(limit) : 50);
    }
    return this.svc.listPublic(limit ? parseInt(limit) : 50);
  }

  @Get('enterprise/matches')
  async getEnterpriseMatches(@Request() req: any) {
    if (!req.user.institutionId) {
      return [];
    }
    return this.matchingService.getMatchesForEnterprise(req.user.institutionId);
  }

  @Post('enterprise/matches/:id/accept')
  async acceptMatch(@Param('id') proposalId: string, @Request() req: any) {
    if (!req.user.institutionId) {
      throw new Error('Enterprise institution required');
    }
    await this.matchingService.acceptMatch(proposalId, req.user.institutionId);
    return {success: true};
  }

  @Get('approvals/pending')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.INSTITUTION_ADMIN)
  async getPendingApprovals(@Query('level') level?: ApprovalLevel) {
    if (level) {
      return this.approvalService.getPendingApprovals(level);
    }
    // Return all pending approvals
    const [institutional, ministry, industry] = await Promise.all([
      this.approvalService.getPendingApprovals(ApprovalLevel.INSTITUTIONAL_ADMIN),
      this.approvalService.getPendingApprovals(ApprovalLevel.MINISTRY),
      this.approvalService.getPendingApprovals(ApprovalLevel.INDUSTRY_SELECTION)
    ]);
    return {institutional, ministry, industry};
  }

  @Get('approvals/stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getApprovalStats() {
    return this.approvalService.getApprovalStatistics();
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: {content?: string; trl?: number; status?: string; strategicAlignment?: string[]},
    @Request() req: any
  ) {
    return this.svc.update(id, req.user.id, req.user.role, body);
  }

  @Post(':id/reviews')
  async submitReview(
    @Param('id') proposalId: string,
    @Body() body: {score: number; comments?: string},
    @Request() req: any
  ) {
    return this.svc.submitReview(proposalId, req.user.id, body);
  }

  /**
   * Helper method to evaluate and classify a proposal
   */
  private async evaluateAndClassify(proposalId: string) {
    // Run AI evaluation
    const evaluation = await this.aiService.evaluateProposal(proposalId);

    // Save evaluation
    await this.svc.saveEvaluation(proposalId, evaluation);

    // Classify into tier
    const classification = await this.tierService.classifyProposal(
      proposalId,
      evaluation.overallScore,
      evaluation.qualityScore,
      evaluation.innovationScore,
      evaluation.feasibilityScore,
      evaluation.alignmentScore
    );

    // Auto-find matches if tier 1 or 2
    if (classification.tier === ProposalTier.TIER_1 || classification.tier === ProposalTier.TIER_2) {
      const matches = await this.matchingService.findMatchesForProposal(proposalId);
      await this.matchingService.saveMatches(proposalId, matches);
    }

    return {evaluation, classification};
  }
}

