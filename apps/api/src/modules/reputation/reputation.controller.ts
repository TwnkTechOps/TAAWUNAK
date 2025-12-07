import {Controller, Get, Param, Request, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/jwt.guard';
import {ReputationService} from './reputation.service';

@Controller('reputation')
export class ReputationController {
  constructor(private svc: ReputationService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myReputation(@Request() req: any) {
    return this.svc.calculateUserReputation(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async userReputation(@Param('userId') userId: string) {
    return this.svc.calculateUserReputation(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('institution/:institutionId')
  async institutionReputation(@Param('institutionId') institutionId: string) {
    return this.svc.calculateInstitutionReputation(institutionId);
  }
}

