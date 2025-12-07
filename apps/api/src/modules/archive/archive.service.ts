import {Injectable, ForbiddenException, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../../services/prisma.service';

@Injectable()
export class ArchiveService {
  constructor(private prisma: PrismaService) {}

  async archiveProject(projectId: string, userId: string, userRole: string, reason?: string) {
    const project = await this.prisma.project.findUnique({
      where: {id: projectId}
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Only owner or admin can archive
    if (project.ownerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only project owner or admin can archive');
    }

    // Update project status to ARCHIVED
    await this.prisma.project.update({
      where: {id: projectId},
      data: {status: 'ARCHIVED'}
    });

    // Create archive record (if ProjectArchive model exists)
    try {
      await (this.prisma as any).projectArchive.create({
        data: {
          projectId,
          archivedBy: userId,
          reason,
          archivedAt: new Date()
        }
      });
    } catch (e) {
      // Model might not exist yet, that's okay for demo
    }

    return {success: true, message: 'Project archived successfully'};
  }

  async listArchived(userId?: string, userRole?: string) {
    if (userRole === 'ADMIN') {
      return this.prisma.project.findMany({
        where: {status: 'ARCHIVED'},
        include: {
          institution: true,
          owner: {select: {id: true, email: true, fullName: true}},
          _count: {select: {milestones: true, documents: true, participants: true}}
        },
        orderBy: {updatedAt: 'desc'}
      });
    }

    if (userId) {
      return this.prisma.project.findMany({
        where: {
          status: 'ARCHIVED',
          OR: [
            {ownerId: userId},
            {participants: {some: {userId, status: 'ACTIVE'}}}
          ]
        },
        include: {
          institution: true,
          owner: {select: {id: true, email: true, fullName: true}},
          _count: {select: {milestones: true, documents: true, participants: true}}
        },
        orderBy: {updatedAt: 'desc'}
      });
    }

    return [];
  }

  async restoreProject(projectId: string, userId: string, userRole: string) {
    const project = await this.prisma.project.findUnique({
      where: {id: projectId}
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.status !== 'ARCHIVED') {
      throw new ForbiddenException('Project is not archived');
    }

    // Only admin can restore
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Only admin can restore archived projects');
    }

    await this.prisma.project.update({
      where: {id: projectId},
      data: {status: 'ACTIVE'}
    });

    // Update archive record if exists
    try {
      await (this.prisma as any).projectArchive.updateMany({
        where: {projectId, restoredAt: null},
        data: {restoredAt: new Date()}
      });
    } catch (e) {
      // Model might not exist
    }

    return {success: true, message: 'Project restored successfully'};
  }
}

