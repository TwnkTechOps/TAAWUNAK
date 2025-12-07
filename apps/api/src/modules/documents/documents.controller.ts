import {Body, Controller, Get, Post, Param, Delete, Request, UseGuards, Query} from '@nestjs/common';
import {DocumentsService} from './documents.service';
import {JwtAuthGuard} from '../auth/jwt.guard';

@Controller('projects/:projectId/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly svc: DocumentsService) {}

  @Get()
  async list(@Param('projectId') projectId: string, @Request() req: any) {
    return this.svc.list(projectId, req.user?.id, req.user?.role);
  }

  @Get('upload-url')
  async getUploadUrl(
    @Param('projectId') projectId: string,
    @Query('fileName') fileName: string,
    @Query('contentType') contentType: string,
    @Request() req: any
  ) {
    return this.svc.getPresignedUploadUrl(projectId, fileName, contentType, req.user.id, req.user.role);
  }

  @Post()
  async create(
    @Param('projectId') projectId: string,
    @Body() body: {name: string; s3Key: string; contentType: string; size?: number},
    @Request() req: any
  ) {
    return this.svc.create(projectId, body, req.user.id, req.user.role);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Request() req: any) {
    return this.svc.getById(id, req.user?.id, req.user?.role);
  }

  @Post(':id/versions')
  async createVersion(
    @Param('id') documentId: string,
    @Body() body: {s3Key: string; changeNote?: string; size?: number},
    @Request() req: any
  ) {
    return this.svc.createVersion(documentId, body, req.user.id, req.user.role);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.svc.delete(id, req.user.id, req.user.role);
  }
}

