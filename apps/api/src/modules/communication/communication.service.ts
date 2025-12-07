import {Injectable, ForbiddenException, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../../services/prisma.service';

@Injectable()
export class CommunicationService {
  constructor(private prisma: PrismaService) {}

  async getMessages(projectId: string, userId?: string, userRole?: string) {
    // Verify project access
    await this.verifyProjectAccess(projectId, userId, userRole);

    return (this.prisma as any).projectMessage.findMany({
      where: {projectId},
      include: {
        user: {select: {id: true, email: true, fullName: true}},
        project: {select: {id: true, title: true}}
      },
      orderBy: {createdAt: 'asc'}
    });
  }

  async createMessage(projectId: string, userId: string, content: string, parentId?: string) {
    await this.verifyProjectAccess(projectId, userId);

    const message = await (this.prisma as any).projectMessage.create({
      data: {
        projectId,
        userId,
        content,
        parentId,
        threadId: parentId || undefined
      },
      include: {
        user: {select: {id: true, email: true, fullName: true}}
      }
    });

    // Create notification for project participants
    await this.notifyParticipants(projectId, userId, 'MESSAGE', `New message in project`);

    return message;
  }

  async getAnnouncements(projectId: string, userId?: string, userRole?: string) {
    await this.verifyProjectAccess(projectId, userId, userRole);

    return (this.prisma as any).projectAnnouncement.findMany({
      where: {projectId},
      include: {
        user: {select: {id: true, email: true, fullName: true}}
      },
      orderBy: {createdAt: 'desc'}
    });
  }

  async createAnnouncement(
    projectId: string,
    userId: string,
    data: {title: string; content: string; priority?: string}
  ) {
    // Only owner or admin can create announcements
    const project = await this.prisma.project.findUnique({
      where: {id: projectId}
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can create announcements');
    }

    const announcement = await (this.prisma as any).projectAnnouncement.create({
      data: {
        projectId,
        userId,
        title: data.title,
        content: data.content,
        priority: data.priority || 'NORMAL'
      },
      include: {
        user: {select: {id: true, email: true, fullName: true}}
      }
    });

    // Create notification for project participants
    await this.notifyParticipants(projectId, userId, 'SYSTEM', `New announcement: ${data.title}`);

    return announcement;
  }

  private async verifyProjectAccess(projectId: string, userId?: string, userRole?: string) {
    const project = await this.prisma.project.findUnique({
      where: {id: projectId},
      include: {
        participants: userId
          ? {where: {userId, status: 'ACTIVE'}}
          : false
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (userRole === 'ADMIN') {
      return;
    }

    if (userId) {
      const isOwner = project.ownerId === userId;
      const isParticipant = (project as any).projectParticipants?.length > 0;
      if (isOwner || isParticipant) {
        return;
      }
    }

    throw new ForbiddenException('Access denied');
  }

  private async notifyParticipants(projectId: string, senderId: string, type: string, message: string) {
    const project = await this.prisma.project.findUnique({
      where: {id: projectId},
      include: {
        participants: {
          where: {status: 'ACTIVE', userId: {not: senderId}}
        }
      }
    });

    if (!project) return;

    const participants = (project as any).participants || [];
    
    // Create notifications for all participants
    for (const participant of participants) {
      await (this.prisma as any).notification.create({
        data: {
          userId: participant.userId,
          type,
          title: 'Project Update',
          message,
          link: `/projects/${projectId}`
        }
      });
    }
  }
}

