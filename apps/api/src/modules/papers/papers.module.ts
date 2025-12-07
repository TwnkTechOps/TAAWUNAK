import { Module } from '@nestjs/common';
import { PapersController } from './papers.controller';
import { PapersService } from './papers.service';
import { PrismaService } from '../../services/prisma.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [PapersController],
  providers: [PapersService, PrismaService],
  exports: [PapersService]
})
export class PapersModule {}

