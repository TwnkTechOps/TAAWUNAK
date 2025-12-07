import {Body, Controller, Get, Post, Param, Request, UseGuards} from '@nestjs/common';
import {CommunicationService} from './communication.service';
import {JwtAuthGuard} from '../auth/jwt.guard';

@Controller('projects/:projectId/communication')
@UseGuards(JwtAuthGuard)
export class CommunicationController {
  constructor(private readonly svc: CommunicationService) {}

  @Get('messages')
  async getMessages(@Param('projectId') projectId: string, @Request() req: any) {
    return this.svc.getMessages(projectId, req.user?.id, req.user?.role);
  }

  @Post('messages')
  async createMessage(
    @Param('projectId') projectId: string,
    @Body() body: {content: string; parentId?: string},
    @Request() req: any
  ) {
    return this.svc.createMessage(projectId, req.user.id, body.content, body.parentId);
  }

  @Get('announcements')
  async getAnnouncements(@Param('projectId') projectId: string, @Request() req: any) {
    return this.svc.getAnnouncements(projectId, req.user?.id, req.user?.role);
  }

  @Post('announcements')
  async createAnnouncement(
    @Param('projectId') projectId: string,
    @Body() body: {title: string; content: string; priority?: string},
    @Request() req: any
  ) {
    return this.svc.createAnnouncement(projectId, req.user.id, body);
  }
}

