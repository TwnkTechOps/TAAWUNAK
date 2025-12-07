import { Module } from '@nestjs/common';
import { SchoolsEngagementController } from './schools-engagement.controller';
import { StudentPortalService } from './services/student-portal.service';
import { TeacherProjectsService } from './services/teacher-projects.service';
import { InnovationClubsService } from './services/innovation-clubs.service';
import { GamificationService } from './services/gamification.service';
import { CompetitionsService } from './services/competitions.service';
import { CertificationService } from './services/certification.service';
import { SchoolMentorshipService } from './services/mentorship.service';
import { ProgressTrackingService } from './services/progress-tracking.service';
import { PrismaService } from '../../services/prisma.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [SchoolsEngagementController],
  providers: [
    StudentPortalService,
    TeacherProjectsService,
    InnovationClubsService,
    GamificationService,
    CompetitionsService,
    CertificationService,
    SchoolMentorshipService,
    ProgressTrackingService,
    PrismaService
  ],
  exports: [
    StudentPortalService,
    TeacherProjectsService,
    InnovationClubsService,
    GamificationService,
    CompetitionsService,
    CertificationService,
    SchoolMentorshipService,
    ProgressTrackingService
  ]
})
export class SchoolsEngagementModule {}

