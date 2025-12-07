import { Controller, Get, Post, Put, Delete, Param, Body, Request, UseGuards, Query } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post('articles')
  async createArticle(
    @Request() req: any,
    @Body() body: {
      title: string;
      content: string;
      excerpt?: string;
      category?: string;
      tags?: string[];
    }
  ) {
    return this.knowledgeService.createArticle(
      req.user.id,
      body.title,
      body.content,
      body.excerpt,
      body.category,
      body.tags
    );
  }

  @Get('articles')
  async getArticles(
    @Request() req: any,
    @Query('category') category?: string,
    @Query('isPublished') isPublished?: string,
    @Query('search') search?: string,
    @Query('authorId') authorId?: string
  ) {
    return this.knowledgeService.getArticles(
      req.user?.id,
      category,
      isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
      search,
      authorId
    );
  }

  @Get('articles/:id')
  async getArticle(@Request() req: any, @Param('id') id: string) {
    return this.knowledgeService.getArticle(id, req.user?.id);
  }

  @Put('articles/:id')
  async updateArticle(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: {
      title?: string;
      content?: string;
      excerpt?: string;
      category?: string;
      tags?: string[];
    }
  ) {
    return this.knowledgeService.updateArticle(id, req.user.id, body);
  }

  @Post('articles/:id/publish')
  async publishArticle(@Request() req: any, @Param('id') id: string) {
    return this.knowledgeService.publishArticle(id, req.user.id);
  }

  @Post('articles/:id/unpublish')
  async unpublishArticle(@Request() req: any, @Param('id') id: string) {
    return this.knowledgeService.unpublishArticle(id, req.user.id);
  }

  @Post('articles/:id/publish-external')
  async publishToExternalPlatform(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { platforms: string[] }
  ) {
    return this.knowledgeService.publishToExternalPlatform(id, req.user.id, body.platforms);
  }

  @Delete('articles/:id')
  async deleteArticle(@Request() req: any, @Param('id') id: string) {
    return this.knowledgeService.deleteArticle(id, req.user.id);
  }
}

