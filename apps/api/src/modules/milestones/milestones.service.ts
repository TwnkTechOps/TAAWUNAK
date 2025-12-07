import {Injectable, NotFoundException, ForbiddenException} from '@nestjs/common';
import {PrismaService} from '../../services/prisma.service';

@Injectable()
export class MilestonesService {
  constructor(private prisma: PrismaService) {}

  async list(projectId: string, userId?: string, userRole?: string) {
    // Verify project access
    await this.verifyProjectAccess(projectId, userId, userRole);

    return this.prisma.milestone.findMany({
      where: {projectId},
      include: {
        tasks: {
          include: {assignee: {select: {id: true, email: true, fullName: true}}},
          orderBy: {dueDate: 'asc'}
        }
      },
      orderBy: {dueDate: 'asc'}
    });
  }

  async getById(id: string, userId?: string, userRole?: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: {id},
      include: {
        project: true,
        tasks: {
          include: {assignee: {select: {id: true, email: true, fullName: true}}}
        }
      }
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    await this.verifyProjectAccess(milestone.projectId, userId, userRole);

    return milestone;
  }

  async create(projectId: string, data: {
    title: string;
    description?: string;
    dueDate?: Date;
  }, userId: string, userRole: string) {
    await this.verifyProjectAccess(projectId, userId, userRole, true);

    return this.prisma.milestone.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      },
      include: {
        tasks: true
      }
    });
  }

  async update(id: string, data: {
    title?: string;
    description?: string;
    dueDate?: Date;
    status?: string;
  }, userId: string, userRole: string) {
    const milestone = await this.getById(id, userId, userRole);
    await this.verifyProjectAccess(milestone.projectId, userId, userRole, true);

    return this.prisma.milestone.update({
      where: {id},
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.status as any
      },
      include: {
        tasks: {
          include: {assignee: {select: {id: true, email: true, fullName: true}}}
        }
      }
    });
  }

  async delete(id: string, userId: string, userRole: string) {
    const milestone = await this.getById(id, userId, userRole);
    await this.verifyProjectAccess(milestone.projectId, userId, userRole, true);

    await this.prisma.milestone.delete({
      where: {id}
    });

    return {success: true};
  }

  // Task management
  async createTask(milestoneId: string, data: {
    title: string;
    description?: string;
    assignedTo?: string;
    dueDate?: Date;
  }, userId: string, userRole: string) {
    const milestone = await this.getById(milestoneId, userId, userRole);
    await this.verifyProjectAccess(milestone.projectId, userId, userRole, true);

    return this.prisma.task.create({
      data: {
        milestoneId,
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      },
      include: {
        assignee: {select: {id: true, email: true, fullName: true}},
        milestone: {select: {id: true, title: true, projectId: true}}
      }
    });
  }

  async updateTask(id: string, data: {
    title?: string;
    description?: string;
    status?: string;
    assignedTo?: string;
    dueDate?: Date;
  }, userId: string, userRole: string) {
    const task = await this.prisma.task.findUnique({
      where: {id},
      include: {milestone: {include: {project: true}}}
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.verifyProjectAccess(task.milestone.projectId, userId, userRole, true);

    const updateData: any = {
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined
    };

    if (data.status === 'COMPLETED' && !task.completedAt) {
      updateData.completedAt = new Date();
    } else if (data.status !== 'COMPLETED' && task.completedAt) {
      updateData.completedAt = null;
    }

    if (data.status) {
      updateData.status = data.status as any;
    }

    return this.prisma.task.update({
      where: {id},
      data: updateData,
      include: {
        assignee: {select: {id: true, email: true, fullName: true}},
        milestone: {select: {id: true, title: true, projectId: true}}
      }
    });
  }

  async deleteTask(id: string, userId: string, userRole: string) {
    const task = await this.prisma.task.findUnique({
      where: {id},
      include: {milestone: {include: {project: true}}}
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.verifyProjectAccess(task.milestone.projectId, userId, userRole, true);

    await this.prisma.task.delete({
      where: {id}
    });

    return {success: true};
  }

  private async verifyProjectAccess(projectId: string, userId?: string, userRole?: string, requireWrite = false) {
    const project = await this.prisma.project.findUnique({
      where: {id: projectId},
      include: {participants: true}
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (userRole === 'ADMIN') {
      return;
    }

    if (userRole === 'INSTITUTION_ADMIN' && userId) {
      const user = await this.prisma.user.findUnique({
        where: {id: userId},
        select: {institutionId: true}
      });
      if (user?.institutionId === project.institutionId) {
        return;
      }
    }

    if (userId) {
      const isOwner = project.ownerId === userId;
      const isParticipant = project.participants.some(p => p.userId === userId && p.status === 'ACTIVE');
      
      if (isOwner || isParticipant) {
        if (requireWrite && !isOwner) {
          const participant = project.participants.find(p => p.userId === userId);
          if (participant?.role !== 'OWNER' && participant?.role !== 'COLLABORATOR') {
            throw new ForbiddenException('Write access required');
          }
        }
        return;
      }
    }

    throw new ForbiddenException('Access denied');
  }
}

