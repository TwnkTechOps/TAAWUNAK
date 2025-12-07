import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {HealthController} from '../routes/health.controller';
import {PrismaService} from '../services/prisma.service';
import {AuthModule} from './auth/auth.module';
import {ProjectsModule} from './projects/projects.module';
import {InstitutionsModule} from './institutions/institutions.module';
import {MembershipsModule} from './memberships/memberships.module';
import {UsersModule} from './users/users.module';
import {MfaModule} from './mfa/mfa.module';
import {CredentialsModule} from './credentials/credentials.module';
import {AuditController} from './audit/audit.controller';
import {AuditService} from './audit/audit.service';
import {VerificationModule} from './verification/verification.module';
import {ReputationModule} from './reputation/reputation.module';
import {MilestonesModule} from './milestones/milestones.module';
import {DocumentsModule} from './documents/documents.module';
import {ProposalsModule} from './proposals/proposals.module';
import {CommunicationModule} from './communication/communication.module';
import {MessagingModule} from './messaging/messaging.module';
import {ForumsModule} from './forums/forums.module';
import {MeetingsModule} from './meetings/meetings.module';
import {EventsModule} from './events/events.module';
import {CommunitiesModule} from './communities/communities.module';
import {KnowledgeModule} from './knowledge/knowledge.module';
import {NotificationsModule} from './notifications/notifications.module';
import {AiModule} from './ai/ai.module';
import {FundingModule} from './funding/funding.module';
import {ArchiveModule} from './archive/archive.module';
import {WebSocketModule} from './websocket/websocket.module';
import {PaymentsModule} from './payments/payments.module';
import {PapersModule} from './papers/papers.module';
import {ParticipationModule} from './participation/participation.module';
import {SchoolsEngagementModule} from './schools-engagement/schools-engagement.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    AuthModule,
    ProjectsModule,
    MilestonesModule,
    DocumentsModule,
    ProposalsModule,
    CommunicationModule,
    MessagingModule,
    ForumsModule,
    MeetingsModule,
    EventsModule,
    CommunitiesModule,
    KnowledgeModule,
    NotificationsModule,
    AiModule,
    FundingModule,
    ArchiveModule,
    WebSocketModule,
    PaymentsModule,
    PapersModule,
    ParticipationModule,
    SchoolsEngagementModule,
    InstitutionsModule,
    MembershipsModule,
    UsersModule,
    MfaModule,
    CredentialsModule,
    VerificationModule,
    ReputationModule
  ],
  controllers: [HealthController, AuditController],
  providers: [PrismaService, AuditService]
})
export class AppModule {}

