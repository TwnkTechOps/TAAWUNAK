import { Controller, Get, Post, Put, Param, Body, Request, UseGuards, Query } from '@nestjs/common';
import { ForumsService } from './forums.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('forums')
@UseGuards(JwtAuthGuard)
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Post()
  async createForum(
    @Request() req: any,
    @Body() body: { title: string; description?: string; category?: string; isPublic?: boolean; tags?: string[] }
  ) {
    return this.forumsService.createForum(
      req.user.id,
      body.title,
      body.description,
      body.category,
      body.isPublic !== false,
      body.tags
    );
  }

  @Get()
  async getForums(
    @Request() req: any,
    @Query('category') category?: string,
    @Query('isPublic') isPublic?: string,
    @Query('search') search?: string
  ) {
    return this.forumsService.getForums(
      req.user?.id,
      category,
      isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
      search
    );
  }

  @Get(':id')
  async getForum(@Request() req: any, @Param('id') id: string) {
    return this.forumsService.getForum(id, req.user?.id);
  }

  @Post(':id/posts')
  async createPost(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { title: string; content: string; tags?: string[] }
  ) {
    return this.forumsService.createPost(id, req.user.id, body.title, body.content, body.tags);
  }

  @Get(':id/posts')
  async getPosts(
    @Request() req: any,
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('sortBy') sortBy?: 'newest' | 'popular' | 'trending'
  ) {
    return this.forumsService.getPosts(
      id,
      req.user?.id,
      limit ? parseInt(limit) : 20,
      cursor,
      sortBy || 'newest'
    );
  }

  @Get('posts/:postId')
  async getPost(@Request() req: any, @Param('postId') postId: string) {
    return this.forumsService.getPost(postId, req.user?.id);
  }

  @Post('posts/:postId/vote')
  async voteOnPost(
    @Request() req: any,
    @Param('postId') postId: string,
    @Body() body: { vote: 'up' | 'down' }
  ) {
    return this.forumsService.voteOnPost(postId, req.user.id, body.vote);
  }

  @Put('posts/:postId/pin')
  async pinPost(
    @Request() req: any,
    @Param('postId') postId: string,
    @Body() body: { forumId: string }
  ) {
    return this.forumsService.pinPost(postId, req.user.id, body.forumId);
  }

  @Put('posts/:postId/lock')
  async lockPost(
    @Request() req: any,
    @Param('postId') postId: string,
    @Body() body: { forumId: string }
  ) {
    return this.forumsService.lockPost(postId, req.user.id, body.forumId);
  }

  @Post('posts/:postId/replies')
  async createReply(
    @Request() req: any,
    @Param('postId') postId: string,
    @Body() body: { content: string; parentId?: string }
  ) {
    return this.forumsService.createReply(postId, req.user.id, body.content, body.parentId);
  }

  @Get('posts/:postId/replies')
  async getReplies(
    @Param('postId') postId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string
  ) {
    return this.forumsService.getReplies(postId, limit ? parseInt(limit) : 50, cursor);
  }

  @Post('replies/:replyId/vote')
  async voteOnReply(
    @Request() req: any,
    @Param('replyId') replyId: string,
    @Body() body: { vote: 'up' | 'down' }
  ) {
    return this.forumsService.voteOnReply(replyId, req.user.id, body.vote);
  }
}

