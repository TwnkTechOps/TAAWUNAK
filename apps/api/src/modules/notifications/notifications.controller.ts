import {Controller, Get, Post, Patch, Param, Delete, Request, UseGuards, Query} from '@nestjs/common';
import {NotificationsService} from './notifications.service';
import {JwtAuthGuard} from '../auth/jwt.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  async list(@Request() req: any, @Query('unreadOnly') unreadOnly?: string) {
    return this.svc.list(req.user.id, unreadOnly === 'true');
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.svc.getUnreadCount(req.user.id);
    return {count};
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.svc.markAsRead(req.user.id, id);
  }

  @Post('mark-all-read')
  async markAllAsRead(@Request() req: any) {
    return this.svc.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.svc.delete(req.user.id, id);
  }
}

