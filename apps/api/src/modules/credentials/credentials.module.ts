import {Module} from '@nestjs/common';
import {CredentialsService} from './credentials.service';
import {CredentialsController} from './credentials.controller';
import {PrismaService} from '../../services/prisma.service';
import {AuditService} from '../audit/audit.service';

@Module({
  providers: [CredentialsService, PrismaService, AuditService],
  controllers: [CredentialsController]
})
export class CredentialsModule {}


