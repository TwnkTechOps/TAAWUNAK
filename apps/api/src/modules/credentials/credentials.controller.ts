import {Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/jwt.guard';
import {CredentialsService} from './credentials.service';
import {Policy} from '../auth/policy.decorator';
import {PolicyGuard} from '../auth/policy.guard';

@Controller('credentials')
export class CredentialsController {
  constructor(private svc: CredentialsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Request() req: any) {
    return this.svc.list(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() body: {type: 'ORCID' | 'ID_DOC' | 'CERT'; s3Key?: string}) {
    return this.svc.create(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.svc.remove(req.user.id, id);
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @Policy('credentials:verify')
  @Get('/admin/all')
  async listAll() {
    return this.svc.listAll();
  }

  @UseGuards(JwtAuthGuard, PolicyGuard)
  @Policy('credentials:verify')
  @Patch('/:id/status')
  async setStatus(@Param('id') id: string, @Body() body: {status: 'PENDING'|'VERIFIED'|'REJECTED'}) {
    return this.svc.setStatus(id, body.status);
  }
}


