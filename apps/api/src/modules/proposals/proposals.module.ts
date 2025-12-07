import {Module} from '@nestjs/common';
import {ProposalsController} from './proposals.controller';
import {ProposalsService} from './proposals.service';
import {PrismaService} from '../../services/prisma.service';
import {TierClassificationService} from './services/tier-classification.service';
import {MatchingEngineService} from './services/matching-engine.service';
import {ApprovalWorkflowService} from './services/approval-workflow.service';
import {AiModule} from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [ProposalsController],
  providers: [
    ProposalsService,
    TierClassificationService,
    MatchingEngineService,
    ApprovalWorkflowService,
    PrismaService
  ],
  exports: [
    ProposalsService,
    TierClassificationService,
    MatchingEngineService,
    ApprovalWorkflowService
  ]
})
export class ProposalsModule {}

