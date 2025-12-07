import { Controller, Get, Post, Put, Delete, Param, Body, Request, UseGuards, Query } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('communities')
@UseGuards(JwtAuthGuard)
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Post('channels')
  async createChannel(
    @Request() req: any,
    @Body() body: { name: string; description?: string; category?: string; isPublic?: boolean }
  ) {
    return this.communitiesService.createChannel(
      req.user.id,
      body.name,
      body.description,
      body.category || 'GENERAL',
      body.isPublic !== false
    );
  }

  @Get('channels')
  async getChannels(
    @Request() req: any,
    @Query('category') category?: string,
    @Query('isPublic') isPublic?: string,
    @Query('search') search?: string
  ) {
    return this.communitiesService.getChannels(
      req.user?.id,
      category,
      isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
      search
    );
  }

  @Get('channels/:id')
  async getChannel(@Request() req: any, @Param('id') id: string) {
    return this.communitiesService.getChannel(id, req.user?.id);
  }

  @Post('channels/:id/join')
  async joinChannel(@Request() req: any, @Param('id') id: string) {
    return this.communitiesService.joinChannel(id, req.user.id);
  }

  @Post('channels/:id/leave')
  async leaveChannel(@Request() req: any, @Param('id') id: string) {
    return this.communitiesService.leaveChannel(id, req.user.id);
  }

  @Put('channels/:id/members/:userId/role')
  async updateMemberRole(
    @Request() req: any,
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() body: { role: 'MEMBER' | 'MODERATOR' }
  ) {
    return this.communitiesService.updateMemberRole(id, userId, req.user.id, body.role);
  }

  @Post('channels/:id/posts')
  async createChannelPost(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { content: string }
  ) {
    return this.communitiesService.createChannelPost(id, req.user.id, body.content);
  }

  @Get('channels/:id/posts')
  async getChannelPosts(
    @Request() req: any,
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string
  ) {
    return this.communitiesService.getChannelPosts(id, req.user.id, limit ? parseInt(limit) : 50, cursor);
  }

  @Put('channels/:id/posts/:postId/pin')
  async pinPost(
    @Request() req: any,
    @Param('id') id: string,
    @Param('postId') postId: string
  ) {
    return this.communitiesService.pinPost(id, postId, req.user.id);
  }

  @Delete('channels/:id/posts/:postId')
  async deletePost(
    @Request() req: any,
    @Param('id') id: string,
    @Param('postId') postId: string
  ) {
    return this.communitiesService.deletePost(id, postId, req.user.id);
  }
}

