import {Module} from '@nestjs/common';
import {InstitutionsController} from './institutions.controller';
import {InstitutionsService} from './institutions.service';
import {PrismaService} from '../../services/prisma.service';
import {AuditService} from '../audit/audit.service';
import {InstitutionAdminGuard} from '../auth/roles.guard';

@Module({
  controllers: [InstitutionsController],
  providers: [InstitutionsService, PrismaService, AuditService, InstitutionAdminGuard],
  exports: [InstitutionsService]
})
export class InstitutionsModule {}

