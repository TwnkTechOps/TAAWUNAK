import {Module} from '@nestjs/common';
import {MembershipsController} from './memberships.controller';
import {MembershipsService} from './memberships.service';
import {PrismaService} from '../../services/prisma.service';
import {AuditService} from '../audit/audit.service';
import {InstitutionAdminGuard} from '../auth/roles.guard';

@Module({
  controllers: [MembershipsController],
  providers: [MembershipsService, PrismaService, AuditService, InstitutionAdminGuard],
  exports: [MembershipsService]
})
export class MembershipsModule {}

