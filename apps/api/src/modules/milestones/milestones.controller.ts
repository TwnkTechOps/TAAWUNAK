import {Body, Controller, Get, Post, Patch, Param, Delete, Request, UseGuards} from '@nestjs/common';
import {MilestonesService} from './milestones.service';
import {JwtAuthGuard} from '../auth/jwt.guard';

@Controller('projects/:projectId/milestones')
@UseGuards(JwtAuthGuard)
export class MilestonesController {
  constructor(private readonly svc: MilestonesService) {}

  @Get()
  async list(@Param('projectId') projectId: string, @Request() req: any) {
    return this.svc.list(projectId, req.user?.id, req.user?.role);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Request() req: any) {
    return this.svc.getById(id, req.user?.id, req.user?.role);
  }

  @Post()
  async create(
    @Param('projectId') projectId: string,
    @Body() body: {title: string; description?: string; dueDate?: string},
    @Request() req: any
  ) {
    return this.svc.create(projectId, {...body, dueDate: body.dueDate ? new Date(body.dueDate) : undefined}, req.user.id, req.user.role);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: {title?: string; description?: string; dueDate?: string; status?: string},
    @Request() req: any
  ) {
    return this.svc.update(id, {...body, dueDate: body.dueDate ? new Date(body.dueDate) : undefined}, req.user.id, req.user.role);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.svc.delete(id, req.user.id, req.user.role);
  }

  @Post(':id/tasks')
  async createTask(
    @Param('id') milestoneId: string,
    @Body() body: {title: string; description?: string; assignedTo?: string; dueDate?: string},
    @Request() req: any
  ) {
    return this.svc.createTask(milestoneId, {...body, dueDate: body.dueDate ? new Date(body.dueDate) : undefined}, req.user.id, req.user.role);
  }

  @Patch('tasks/:taskId')
  async updateTask(
    @Param('taskId') id: string,
    @Body() body: {title?: string; description?: string; status?: string; assignedTo?: string; dueDate?: string},
    @Request() req: any
  ) {
    return this.svc.updateTask(id, {...body, dueDate: body.dueDate ? new Date(body.dueDate) : undefined}, req.user.id, req.user.role);
  }

  @Delete('tasks/:taskId')
  async deleteTask(@Param('taskId') id: string, @Request() req: any) {
    return this.svc.deleteTask(id, req.user.id, req.user.role);
  }
}

