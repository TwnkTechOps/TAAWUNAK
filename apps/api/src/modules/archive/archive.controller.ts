import {Body, Controller, Get, Post, Param, Request, UseGuards} from '@nestjs/common';
import {ArchiveService} from './archive.service';
import {JwtAuthGuard} from '../auth/jwt.guard';

@Controller('archive')
@UseGuards(JwtAuthGuard)
export class ArchiveController {
  constructor(private readonly svc: ArchiveService) {}

  @Get('projects')
  async listArchived(@Request() req: any) {
    return this.svc.listArchived(req.user?.id, req.user?.role);
  }

  @Post('projects/:id/archive')
  async archiveProject(
    @Param('id') projectId: string,
    @Body() body: {reason?: string},
    @Request() req: any
  ) {
    return this.svc.archiveProject(projectId, req.user.id, req.user.role, body.reason);
  }

  @Post('projects/:id/restore')
  async restoreProject(@Param('id') projectId: string, @Request() req: any) {
    return this.svc.restoreProject(projectId, req.user.id, req.user.role);
  }
}

