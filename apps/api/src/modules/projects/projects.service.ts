import {Injectable, ForbiddenException, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../../services/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async list(userId?: string, userRole?: string) {
    // Admin can see all projects
    if (userRole === 'ADMIN') {
      return this.prisma.project.findMany({
        include: {
          institution: true,
          owner: {select: {id: true, email: true, fullName: true}},
          participants: {
            include: {user: {select: {id: true, email: true, fullName: true}}}
          },
          _count: {select: {milestones: true, documents: true, participants: true}}
        },
        orderBy: {createdAt: 'desc'}
      });
    }

    // Institution admin sees their institution's projects
    if (userRole === 'INSTITUTION_ADMIN' && userId) {
      const user = await this.prisma.user.findUnique({
        where: {id: userId},
        select: {institutionId: true}
      });
      if (user?.institutionId) {
        return this.prisma.project.findMany({
          where: {institutionId: user.institutionId},
          include: {
            institution: true,
            owner: {select: {id: true, email: true, fullName: true}},
            participants: {
              include: {user: {select: {id: true, email: true, fullName: true}}}
            },
            _count: {select: {milestones: true, documents: true}}
          },
          orderBy: {createdAt: 'desc'}
        });
      }
    }

    // Regular users see projects they own or participate in
    if (userId) {
      return this.prisma.project.findMany({
        where: {
          OR: [
            {ownerId: userId},
            {participants: {some: {userId, status: 'ACTIVE'}}}
          ]
        },
        include: {
          institution: true,
          owner: {select: {id: true, email: true, fullName: true}},
          participants: {
            include: {user: {select: {id: true, email: true, fullName: true}}}
          },
          _count: {select: {milestones: true, documents: true, participants: true}}
        },
        orderBy: {createdAt: 'desc'}
      });
    }

    return [];
  }

  async getById(id: string, userId?: string, userRole?: string) {
    const project = await this.prisma.project.findUnique({
      where: {id},
      include: {
        institution: true,
        owner: {select: {id: true, email: true, fullName: true}},
        template: true,
        participants: {
          include: {user: {select: {id: true, email: true, fullName: true, role: true}}}
        },
        milestones: {
          include: {
            tasks: {
              include: {assignee: {select: {id: true, email: true, fullName: true}}}
            }
          },
          orderBy: {dueDate: 'asc'}
        },
        documents: {
          include: {createdBy: {select: {id: true, email: true, fullName: true}}},
          orderBy: {createdAt: 'desc'}
        },
        _count: {select: {milestones: true, documents: true, participants: true, proposals: true}}
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check access permissions
    if (userRole !== 'ADMIN') {
      if (userRole === 'INSTITUTION_ADMIN' && userId) {
        const user = await this.prisma.user.findUnique({
          where: {id: userId},
          select: {institutionId: true}
        });
        if (user?.institutionId !== project.institutionId) {
          throw new ForbiddenException('Access denied');
        }
      } else if (userId) {
        const isOwner = project.ownerId === userId;
        const isParticipant =
          (project as any).participants?.some((p: any) => p.userId === userId && p.status === 'ACTIVE') || false;
        if (!isOwner && !isParticipant) {
          throw new ForbiddenException('Access denied');
        }
      }
    }

    return project;
  }

  async create(input: {
    title: string;
    summary: string;
    description?: string;
    institutionId: string;
    ownerId: string;
    templateId?: string;
  }) {
    const project = await this.prisma.project.create({
      data: {
        title: input.title,
        summary: input.summary,
        // description: input.description, // Add when migration is run
        institutionId: input.institutionId,
        ownerId: input.ownerId,
        templateId: input.templateId
      }
    });

    // Automatically add owner as participant with OWNER role
    await (this.prisma as any).projectParticipant.create({
      data: {
        projectId: project.id,
        userId: input.ownerId,
        role: 'OWNER',
        status: 'ACTIVE'
      }
    });

    return this.getById(project.id, input.ownerId);
  }

  async update(id: string, userId: string, userRole: string, data: {
    title?: string;
    summary?: string;
    description?: string;
    status?: string;
  }) {
    // Check permissions
    const project = await this.getById(id, userId, userRole);
    
    // Only owner or admin can update
    if (project.ownerId !== userId && userRole !== 'ADMIN') {
      if (userRole === 'INSTITUTION_ADMIN') {
        const user = await this.prisma.user.findUnique({
          where: {id: userId},
          select: {institutionId: true}
        });
        if (user?.institutionId !== project.institutionId) {
          throw new ForbiddenException('Only project owner or admin can update');
        }
      } else {
        throw new ForbiddenException('Only project owner or admin can update');
      }
    }

    return this.prisma.project.update({
      where: {id},
      data: {
        title: data.title,
        summary: data.summary,
        // description: data.description, // Add when migration is run
        status: data.status as any
      },
      include: {
        institution: true,
        owner: {select: {id: true, email: true, fullName: true}},
        participants: {
          include: {user: {select: {id: true, email: true, fullName: true}}}
        }
      }
    });
  }

  async addParticipant(projectId: string, userId: string, targetUserId: string, role: string, requesterRole: string) {
    const project = await this.getById(projectId, userId, requesterRole);
    
    // Check if requester can add participants
    if (project.ownerId !== userId && requesterRole !== 'ADMIN') {
      if (requesterRole === 'INSTITUTION_ADMIN') {
        const user = await this.prisma.user.findUnique({
          where: {id: userId},
          select: {institutionId: true}
        });
        if (user?.institutionId !== project.institutionId) {
          throw new ForbiddenException('Only project owner or admin can add participants');
        }
      } else {
        const participants = (project as any).participants || [];
        const participant = participants.find((p: any) => p.userId === userId);
        if (!participant || participant.role !== 'OWNER') {
          throw new ForbiddenException('Only project owner can add participants');
        }
      }
    }

    // Check if already a participant
    const existing = await (this.prisma as any).projectParticipant.findUnique({
      where: {projectId_userId: {projectId, userId: targetUserId}}
    });

    if (existing) {
      return (this.prisma as any).projectParticipant.update({
        where: {id: existing.id},
        data: {role: role as any, status: 'ACTIVE'},
        include: {user: {select: {id: true, email: true, fullName: true}}}
      });
    }

    return (this.prisma as any).projectParticipant.create({
      data: {
        projectId,
        userId: targetUserId,
        role: role as any,
        status: 'ACTIVE'
      },
      include: {user: {select: {id: true, email: true, fullName: true}}}
    });
  }

  async removeParticipant(projectId: string, userId: string, targetUserId: string, requesterRole: string) {
    const project = await this.getById(projectId, userId, requesterRole);
    
    // Cannot remove owner
    if (project.ownerId === targetUserId) {
      throw new ForbiddenException('Cannot remove project owner');
    }

    // Check permissions
    if (project.ownerId !== userId && requesterRole !== 'ADMIN') {
      throw new ForbiddenException('Only project owner or admin can remove participants');
    }

    await (this.prisma as any).projectParticipant.deleteMany({
      where: {projectId, userId: targetUserId}
    });

    return {success: true};
  }

  async getTemplates() {
    return (this.prisma as any).projectTemplate.findMany({
      where: {isPublic: true},
      orderBy: {createdAt: 'desc'}
    });
  }

  async getReport(projectId: string, userId?: string, userRole?: string) {
    const project = await this.getById(projectId, userId, userRole);

    // Get detailed statistics
    const milestones = await this.prisma.milestone.findMany({
      where: {projectId},
      include: {
        tasks: {
          include: {assignee: {select: {id: true, email: true, fullName: true}}}
        } as any
      }
    });

    const documents = await this.prisma.document.findMany({
      where: {projectId},
      include: {
        createdBy: {select: {id: true, email: true, fullName: true}},
        _count: {select: {versions: true}} as any
      }
    });

    const participants = await (this.prisma as any).projectParticipant.findMany({
      where: {projectId, status: 'ACTIVE'},
      include: {user: {select: {id: true, email: true, fullName: true, role: true}}}
    });

    // Calculate statistics
    const totalTasks = milestones.reduce((sum: number, m: any) => sum + (m.tasks?.length || 0), 0);
    const completedTasks = milestones.reduce((sum: number, m: any) => sum + (m.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0), 0);
    const completedMilestones = milestones.filter(m => m.status === 'DONE').length;
    const totalDocuments = documents.length;
    const totalVersions = documents.reduce((sum: number, d: any) => sum + (d._count?.versions || 0), 0);

    // Task status breakdown
    const taskStatusBreakdown = {
      PENDING: milestones.reduce((sum: number, m: any) => sum + (m.tasks?.filter((t: any) => t.status === 'PENDING').length || 0), 0),
      IN_PROGRESS: milestones.reduce((sum: number, m: any) => sum + (m.tasks?.filter((t: any) => t.status === 'IN_PROGRESS').length || 0), 0),
      COMPLETED: completedTasks,
      BLOCKED: milestones.reduce((sum: number, m: any) => sum + (m.tasks?.filter((t: any) => t.status === 'BLOCKED').length || 0), 0),
    };

    // Milestone status breakdown
    const milestoneStatusBreakdown = {
      PENDING: milestones.filter(m => m.status === 'PENDING').length,
      IN_PROGRESS: milestones.filter(m => m.status === 'IN_PROGRESS').length,
      DONE: completedMilestones,
    };

    // Participant role breakdown
    const participantRoleBreakdown = {
      OWNER: participants.filter((p: any) => p.role === 'OWNER').length,
      COLLABORATOR: participants.filter((p: any) => p.role === 'COLLABORATOR').length,
      REVIEWER: participants.filter((p: any) => p.role === 'REVIEWER').length,
      VIEWER: participants.filter((p: any) => p.role === 'VIEWER').length,
    };

    // Timeline data for Gantt chart
    const timelineData = milestones.map(m => ({
      id: m.id,
      name: m.title,
      startDate: m.createdAt.toISOString(),
      endDate: m.dueDate?.toISOString() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: m.status,
      progress: (m as any).tasks?.length > 0 
        ? ((m as any).tasks.filter((t: any) => t.status === 'COMPLETED').length / (m as any).tasks.length) * 100 
        : 0,
    }));

    return {
      project: {
        id: project.id,
        title: project.title,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      statistics: {
        milestones: {
          total: milestones.length,
          completed: completedMilestones,
          breakdown: milestoneStatusBreakdown,
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          breakdown: taskStatusBreakdown,
        },
        documents: {
          total: totalDocuments,
          totalVersions: totalVersions,
        },
        participants: {
          total: participants.length,
          breakdown: participantRoleBreakdown,
        },
      },
      timeline: timelineData,
      generatedAt: new Date().toISOString(),
    };
  }

  exportReport(report: any, format: string): string | Buffer {
    if (format === 'pdf') {
      try {
        // Try to use pdfkit if available
        const PDFDocument = require('pdfkit');
        return this.generatePDFReport(report, PDFDocument);
      } catch (error) {
        // Fallback to text if pdfkit not available
        return this.generateTextReport(report);
      }
    }

    if (format === 'xlsx') {
      try {
        // Try to use xlsx if available
        const XLSX = require('xlsx');
        return this.generateExcelReport(report, XLSX);
      } catch (error) {
        // Fallback to CSV if xlsx not available
        return this.generateCSVReport(report);
      }
    }

    // Default: text export
    return this.generateTextReport(report);
  }

  private generatePDFReport(report: any, PDFDocument: any): Buffer {
    const doc = new PDFDocument({margin: 50});
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => {});

    // Header
    doc.fontSize(20).text('PROJECT REPORT', {align: 'center'});
    doc.moveDown();

    // Project Info
    doc.fontSize(14).text(`Project: ${report.project.title}`);
    doc.text(`Status: ${report.project.status}`);
    doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`);
    doc.moveDown();

    // Statistics
    doc.fontSize(16).text('STATISTICS', {underline: true});
    doc.fontSize(12);
    doc.text(`Milestones: ${report.statistics.milestones.completed}/${report.statistics.milestones.total} completed`);
    doc.text(`Tasks: ${report.statistics.tasks.completed}/${report.statistics.tasks.total} completed (${report.statistics.tasks.completionRate}%)`);
    doc.text(`Documents: ${report.statistics.documents.total} (${report.statistics.documents.totalVersions} versions)`);
    doc.text(`Participants: ${report.statistics.participants.total}`);
    doc.moveDown();

    // Milestone Status
    doc.fontSize(16).text('MILESTONE STATUS', {underline: true});
    doc.fontSize(12);
    doc.text(`Pending: ${report.statistics.milestones.breakdown.PENDING}`);
    doc.text(`In Progress: ${report.statistics.milestones.breakdown.IN_PROGRESS}`);
    doc.text(`Done: ${report.statistics.milestones.breakdown.DONE}`);
    doc.moveDown();

    // Task Status
    doc.fontSize(16).text('TASK STATUS', {underline: true});
    doc.fontSize(12);
    doc.text(`Pending: ${report.statistics.tasks.breakdown.PENDING}`);
    doc.text(`In Progress: ${report.statistics.tasks.breakdown.IN_PROGRESS}`);
    doc.text(`Completed: ${report.statistics.tasks.breakdown.COMPLETED}`);
    doc.text(`Blocked: ${report.statistics.tasks.breakdown.BLOCKED}`);
    doc.moveDown();

    // Participant Roles
    doc.fontSize(16).text('PARTICIPANT ROLES', {underline: true});
    doc.fontSize(12);
    doc.text(`Owners: ${report.statistics.participants.breakdown.OWNER}`);
    doc.text(`Collaborators: ${report.statistics.participants.breakdown.COLLABORATOR}`);
    doc.text(`Reviewers: ${report.statistics.participants.breakdown.REVIEWER}`);
    doc.text(`Viewers: ${report.statistics.participants.breakdown.VIEWER}`);
    doc.moveDown();

    // Timeline
    doc.fontSize(16).text('TIMELINE', {underline: true});
    doc.fontSize(12);
    report.timeline.forEach((item: any) => {
      doc.text(`${item.name}: ${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()} (${item.status})`);
    });

    doc.end();

    // Wait for PDF to be generated
    return Buffer.concat(chunks);
  }

  private generateExcelReport(report: any, XLSX: any): Buffer {
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Project Report'],
      ['Project', report.project.title],
      ['Status', report.project.status],
      ['Generated', new Date(report.generatedAt).toISOString()],
      [],
      ['Statistics'],
      ['Category', 'Value'],
      ['Milestones Completed', report.statistics.milestones.completed],
      ['Milestones Total', report.statistics.milestones.total],
      ['Tasks Completed', report.statistics.tasks.completed],
      ['Tasks Total', report.statistics.tasks.total],
      ['Tasks Completion Rate', `${report.statistics.tasks.completionRate}%`],
      ['Documents', report.statistics.documents.total],
      ['Document Versions', report.statistics.documents.totalVersions],
      ['Participants', report.statistics.participants.total],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Milestone Status Sheet
    const milestoneData = [
      ['Status', 'Count'],
      ['Pending', report.statistics.milestones.breakdown.PENDING],
      ['In Progress', report.statistics.milestones.breakdown.IN_PROGRESS],
      ['Done', report.statistics.milestones.breakdown.DONE],
    ];
    const milestoneSheet = XLSX.utils.aoa_to_sheet(milestoneData);
    XLSX.utils.book_append_sheet(workbook, milestoneSheet, 'Milestones');

    // Task Status Sheet
    const taskData = [
      ['Status', 'Count'],
      ['Pending', report.statistics.tasks.breakdown.PENDING],
      ['In Progress', report.statistics.tasks.breakdown.IN_PROGRESS],
      ['Completed', report.statistics.tasks.breakdown.COMPLETED],
      ['Blocked', report.statistics.tasks.breakdown.BLOCKED],
    ];
    const taskSheet = XLSX.utils.aoa_to_sheet(taskData);
    XLSX.utils.book_append_sheet(workbook, taskSheet, 'Tasks');

    // Timeline Sheet
    const timelineData = [
      ['Milestone', 'Start Date', 'End Date', 'Status', 'Progress %'],
      ...report.timeline.map((item: any) => [
        item.name,
        new Date(item.startDate).toISOString(),
        new Date(item.endDate).toISOString(),
        item.status,
        `${item.progress}%`,
      ]),
    ];
    const timelineSheet = XLSX.utils.aoa_to_sheet(timelineData);
    XLSX.utils.book_append_sheet(workbook, timelineSheet, 'Timeline');

    return XLSX.write(workbook, {type: 'buffer', bookType: 'xlsx'});
  }

  private generateTextReport(report: any): string {
    const lines = [
      '='.repeat(60),
      'PROJECT REPORT',
      '='.repeat(60),
      '',
      `Project: ${report.project.title}`,
      `Status: ${report.project.status}`,
      `Generated: ${new Date(report.generatedAt).toLocaleString()}`,
      '',
      'STATISTICS',
      '-'.repeat(60),
      `Milestones: ${report.statistics.milestones.completed}/${report.statistics.milestones.total} completed`,
      `Tasks: ${report.statistics.tasks.completed}/${report.statistics.tasks.total} completed (${report.statistics.tasks.completionRate}%)`,
      `Documents: ${report.statistics.documents.total} (${report.statistics.documents.totalVersions} versions)`,
      `Participants: ${report.statistics.participants.total}`,
      '',
      'MILESTONE STATUS',
      '-'.repeat(60),
      `Pending: ${report.statistics.milestones.breakdown.PENDING}`,
      `In Progress: ${report.statistics.milestones.breakdown.IN_PROGRESS}`,
      `Done: ${report.statistics.milestones.breakdown.DONE}`,
      '',
      'TASK STATUS',
      '-'.repeat(60),
      `Pending: ${report.statistics.tasks.breakdown.PENDING}`,
      `In Progress: ${report.statistics.tasks.breakdown.IN_PROGRESS}`,
      `Completed: ${report.statistics.tasks.breakdown.COMPLETED}`,
      `Blocked: ${report.statistics.tasks.breakdown.BLOCKED}`,
      '',
      'PARTICIPANT ROLES',
      '-'.repeat(60),
      `Owners: ${report.statistics.participants.breakdown.OWNER}`,
      `Collaborators: ${report.statistics.participants.breakdown.COLLABORATOR}`,
      `Reviewers: ${report.statistics.participants.breakdown.REVIEWER}`,
      `Viewers: ${report.statistics.participants.breakdown.VIEWER}`,
      '',
      'TIMELINE',
      '-'.repeat(60),
      ...report.timeline.map((item: any) => 
        `${item.name}: ${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()} (${item.status})`
      ),
      '',
      '='.repeat(60),
      'End of Report',
      '='.repeat(60)
    ];

    return lines.join('\n');
  }

  private generateCSVReport(report: any): string {
    const lines = [
      'Project Report',
      `Project,${report.project.title}`,
      `Status,${report.project.status}`,
      `Generated,${new Date(report.generatedAt).toISOString()}`,
      '',
      'Statistics',
      'Category,Value',
      `Milestones Completed,${report.statistics.milestones.completed}`,
      `Milestones Total,${report.statistics.milestones.total}`,
      `Tasks Completed,${report.statistics.tasks.completed}`,
      `Tasks Total,${report.statistics.tasks.total}`,
      `Tasks Completion Rate,${report.statistics.tasks.completionRate}%`,
      `Documents,${report.statistics.documents.total}`,
      `Document Versions,${report.statistics.documents.totalVersions}`,
      `Participants,${report.statistics.participants.total}`,
      '',
      'Milestone Status',
      'Status,Count',
      `Pending,${report.statistics.milestones.breakdown.PENDING}`,
      `In Progress,${report.statistics.milestones.breakdown.IN_PROGRESS}`,
      `Done,${report.statistics.milestones.breakdown.DONE}`,
      '',
      'Task Status',
      'Status,Count',
      `Pending,${report.statistics.tasks.breakdown.PENDING}`,
      `In Progress,${report.statistics.tasks.breakdown.IN_PROGRESS}`,
      `Completed,${report.statistics.tasks.breakdown.COMPLETED}`,
      `Blocked,${report.statistics.tasks.breakdown.BLOCKED}`,
      '',
      'Timeline',
      'Milestone,Start Date,End Date,Status,Progress',
      ...report.timeline.map((item: any) => 
        `"${item.name}",${new Date(item.startDate).toISOString()},${new Date(item.endDate).toISOString()},${item.status},${item.progress}%`
      )
    ];

    return lines.join('\n');
  }
}
