import {Module} from '@nestjs/common';
import {ArchiveController} from './archive.controller';
import {ArchiveService} from './archive.service';
import {PrismaService} from '../../services/prisma.service';

@Module({
  controllers: [ArchiveController],
  providers: [ArchiveService, PrismaService],
  exports: [ArchiveService]
})
export class ArchiveModule {}

