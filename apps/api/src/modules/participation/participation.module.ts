import { Module } from '@nestjs/common';
import { ParticipationController } from './participation.controller';
import { ParticipationService } from './participation.service';
import { PrismaService } from '../../services/prisma.service';

@Module({
  controllers: [ParticipationController],
  providers: [ParticipationService, PrismaService],
  exports: [ParticipationService]
})
export class ParticipationModule {}

