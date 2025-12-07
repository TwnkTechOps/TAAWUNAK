import { Controller, Get, Post, Put, Delete, Param, Body, Request, UseGuards, Query } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  // ==================== Direct Messaging ====================

  @Post('direct')
  async sendDirectMessage(
    @Request() req: any,
    @Body() body: { receiverId: string; content: string; encrypted?: boolean }
  ) {
    return this.messagingService.sendDirectMessage(
      req.user.id,
      body.receiverId,
      body.content,
      body.encrypted !== false
    );
  }

  @Get('direct/conversations')
  async getConversations(@Request() req: any) {
    return this.messagingService.getConversations(req.user.id);
  }

  @Get('direct/:userId')
  async getDirectMessages(
    @Request() req: any,
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string
  ) {
    return this.messagingService.getDirectMessages(
      req.user.id,
      userId,
      limit ? parseInt(limit) : 50,
      cursor
    );
  }

  @Put('direct/:messageId/read')
  async markMessageAsRead(@Request() req: any, @Param('messageId') messageId: string) {
    return this.messagingService.markMessageAsRead(messageId, req.user.id);
  }

  @Put('direct/:messageId/delivered')
  async markMessageAsDelivered(@Request() req: any, @Param('messageId') messageId: string) {
    return this.messagingService.markMessageAsDelivered(messageId, req.user.id);
  }

  // ==================== Group Chat ====================

  @Post('groups')
  async createGroupChat(
    @Request() req: any,
    @Body() body: { name: string; description?: string; isPrivate?: boolean }
  ) {
    return this.messagingService.createGroupChat(
      req.user.id,
      body.name,
      body.description,
      body.isPrivate || false
    );
  }

  @Get('groups')
  async getGroupChats(@Request() req: any) {
    return this.messagingService.getGroupChats(req.user.id);
  }

  @Get('groups/:id')
  async getGroupChat(@Request() req: any, @Param('id') id: string) {
    return this.messagingService.getGroupChat(id, req.user.id);
  }

  @Post('groups/:id/members')
  async addGroupChatMember(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { userId: string; role?: 'MEMBER' | 'ADMIN' }
  ) {
    return this.messagingService.addGroupChatMember(
      id,
      body.userId,
      req.user.id,
      body.role || 'MEMBER'
    );
  }

  @Delete('groups/:id/members/:userId')
  async removeGroupChatMember(
    @Request() req: any,
    @Param('id') id: string,
    @Param('userId') userId: string
  ) {
    return this.messagingService.removeGroupChatMember(id, userId, req.user.id);
  }

  @Post('groups/:id/messages')
  async sendGroupMessage(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { content: string; encrypted?: boolean }
  ) {
    return this.messagingService.sendGroupMessage(
      id,
      req.user.id,
      body.content,
      body.encrypted !== false
    );
  }

  @Get('groups/:id/messages')
  async getGroupMessages(
    @Request() req: any,
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string
  ) {
    return this.messagingService.getGroupMessages(
      id,
      req.user.id,
      limit ? parseInt(limit) : 50,
      cursor
    );
  }
}

