import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {AuditService} from './audit.service';
import {JwtAuthGuard} from '../auth/jwt.guard';
import {Policy} from '../auth/policy.decorator';
import {PolicyGuard} from '../auth/policy.guard';

@Controller('audit')
export class AuditController {
  constructor(private audit: AuditService) {}

  @UseGuards(JwtAuthGuard, PolicyGuard)
  @Policy('audit:read')
  @Get('events')
  async list(@Query('limit') limit?: string) {
    const n = Math.min(Number(limit) || 100, 500);
    return this.audit.list(n);
  }
}


