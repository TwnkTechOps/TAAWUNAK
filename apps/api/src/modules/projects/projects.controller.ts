import {Body, Controller, Get, Post, Patch, Param, Delete, Request, UseGuards, Query, Res} from '@nestjs/common';
import {Response} from 'express';
import {ProjectsService} from './projects.service';
import {JwtAuthGuard} from '../auth/jwt.guard';
import {Roles} from '../auth/roles.decorator';
import {RolesGuard} from '../auth/roles.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly svc: ProjectsService) {}

  @Get()
  async list(@Request() req: any) {
    return this.svc.list(req.user?.id, req.user?.role);
  }

  @Get('templates')
  async getTemplates() {
    return this.svc.getTemplates();
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Request() req: any) {
    return this.svc.getById(id, req.user?.id, req.user?.role);
  }

  @Post()
  async create(@Body() body: {
    title: string;
    summary: string;
    description?: string;
    institutionId: string;
    templateId?: string;
  }, @Request() req: any) {
    return this.svc.create({
      ...body,
      ownerId: req.user.id
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: {title?: string; summary?: string; description?: string; status?: string},
    @Request() req: any
  ) {
    return this.svc.update(id, req.user.id, req.user.role, body);
  }

  @Post(':id/participants')
  async addParticipant(
    @Param('id') projectId: string,
    @Body() body: {userId: string; role: string},
    @Request() req: any
  ) {
    return this.svc.addParticipant(projectId, req.user.id, body.userId, body.role, req.user.role);
  }

  @Delete(':id/participants/:userId')
  async removeParticipant(
    @Param('id') projectId: string,
    @Param('userId') targetUserId: string,
    @Request() req: any
  ) {
    return this.svc.removeParticipant(projectId, req.user.id, targetUserId, req.user.role);
  }

  @Get(':id/report')
  async getReport(@Param('id') id: string, @Request() req: any) {
    return this.svc.getReport(id, req.user?.id, req.user?.role);
  }

  @Get(':id/export')
  async exportReport(
    @Param('id') id: string,
    @Request() req: any,
    @Query('format') format: string = 'txt',
    @Res() res: Response
  ) {
    const report = await this.svc.getReport(id, req.user?.id, req.user?.role);
    const exportData = this.svc.exportReport(report, format);
    
    const contentType = format === 'pdf' ? 'application/pdf' : format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/plain';
    const extension = format === 'pdf' ? 'pdf' : format === 'xlsx' ? 'xlsx' : 'txt';
    const filename = `project-report-${id}-${new Date().toISOString().split('T')[0]}.${extension}`;
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
  }
}

