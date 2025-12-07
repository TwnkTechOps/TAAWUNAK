import {Injectable, NotFoundException, ForbiddenException} from '@nestjs/common';
import {PrismaService} from '../../services/prisma.service';
import {FilesService} from '../files/files.service';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService
  ) {}

  async list(projectId: string, userId?: string, userRole?: string) {
    await this.verifyProjectAccess(projectId, userId, userRole);

    return this.prisma.document.findMany({
      where: {projectId},
      include: {
        createdBy: {select: {id: true, email: true, fullName: true}},
        versions: {
          orderBy: {version: 'desc'},
          take: 1,
          include: {uploader: {select: {id: true, email: true, fullName: true}}}
        },
        _count: {select: {versions: true}}
      },
      orderBy: {createdAt: 'desc'}
    });
  }

  async getById(id: string, userId?: string, userRole?: string) {
    const document = await this.prisma.document.findUnique({
      where: {id},
      include: {
        project: true,
        createdBy: {select: {id: true, email: true, fullName: true}},
        versions: {
          include: {uploader: {select: {id: true, email: true, fullName: true}}},
          orderBy: {version: 'desc'}
        }
      }
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.verifyProjectAccess(document.projectId, userId, userRole);

    return document;
  }

  async create(projectId: string, data: {
    name: string;
    s3Key: string;
    contentType: string;
    size?: number;
  }, userId: string, userRole: string) {
    await this.verifyProjectAccess(projectId, userId, userRole, true);

    const document = await this.prisma.document.create({
      data: {
        projectId,
        name: data.name,
        s3Key: data.s3Key,
        contentType: data.contentType,
        size: data.size,
        createdById: userId
      }
    });

    // Create initial version
    await this.prisma.documentVersion.create({
      data: {
        documentId: document.id,
        version: 1,
        s3Key: data.s3Key,
        uploadedBy: userId,
        size: data.size,
        changeNote: 'Initial version'
      }
    });

    return this.getById(document.id, userId, userRole);
  }

  async createVersion(documentId: string, data: {
    s3Key: string;
    changeNote?: string;
    size?: number;
  }, userId: string, userRole: string) {
    const document = await this.getById(documentId, userId, userRole);
    await this.verifyProjectAccess(document.projectId, userId, userRole, true);

    // Get latest version number
    const latestVersion = await this.prisma.documentVersion.findFirst({
      where: {documentId},
      orderBy: {version: 'desc'},
      select: {version: true}
    });

    const newVersion = (latestVersion?.version || 0) + 1;

    const version = await this.prisma.documentVersion.create({
      data: {
        documentId,
        version: newVersion,
        s3Key: data.s3Key,
        uploadedBy: userId,
        changeNote: data.changeNote || `Version ${newVersion}`,
        size: data.size
      },
      include: {uploader: {select: {id: true, email: true, fullName: true}}}
    });

    return version;
  }

  async delete(id: string, userId: string, userRole: string) {
    const document = await this.getById(id, userId, userRole);
    await this.verifyProjectAccess(document.projectId, userId, userRole, true);

    await this.prisma.document.delete({
      where: {id}
    });

    return {success: true};
  }

  async getPresignedUploadUrl(projectId: string, fileName: string, contentType: string, userId: string, userRole: string) {
    await this.verifyProjectAccess(projectId, userId, userRole, true);

    const key = `projects/${projectId}/documents/${Date.now()}-${fileName}`;
    const presigned = await this.filesService.presignPut(key, contentType);

    return presigned;
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

