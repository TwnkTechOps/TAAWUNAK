import {Module} from '@nestjs/common';
import {DocumentsController} from './documents.controller';
import {DocumentsService} from './documents.service';
import {PrismaService} from '../../services/prisma.service';
import {FilesModule} from '../files/files.module';

@Module({
  imports: [FilesModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, PrismaService],
  exports: [DocumentsService]
})
export class DocumentsModule {}

