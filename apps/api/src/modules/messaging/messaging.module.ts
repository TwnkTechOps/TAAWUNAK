import { Module } from '@nestjs/common';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { PrismaService } from '../../services/prisma.service';
import { EncryptionService } from '../../services/encryption.service';

@Module({
  controllers: [MessagingController],
  providers: [MessagingService, PrismaService, EncryptionService],
  exports: [MessagingService]
})
export class MessagingModule {}

