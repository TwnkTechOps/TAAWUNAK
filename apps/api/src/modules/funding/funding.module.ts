import {Module} from '@nestjs/common';
import {FundingController} from './funding.controller';
import {FundingService} from './funding.service';
import {PrismaService} from '../../services/prisma.service';

@Module({
  controllers: [FundingController],
  providers: [FundingService, PrismaService],
  exports: [FundingService]
})
export class FundingModule {}

