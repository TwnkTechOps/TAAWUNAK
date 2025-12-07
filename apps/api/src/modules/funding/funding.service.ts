import {Injectable, ForbiddenException, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../../services/prisma.service';

@Injectable()
export class FundingService {
  constructor(private prisma: PrismaService) {}

  async listCalls(userId?: string, userRole?: string) {
    if (userRole === 'ADMIN') {
      return this.prisma.fundingCall.findMany({
        include: {
          _count: {select: {applications: true}}
        },
        orderBy: {deadline: 'asc'}
      });
    }

    // All authenticated users can see funding calls
    return this.prisma.fundingCall.findMany({
      where: {
        deadline: {gte: new Date()} // Only active calls
      },
      include: {
        _count: {select: {applications: true}}
      },
      orderBy: {deadline: 'asc'}
    });
  }

  async getCall(id: string) {
    const call = await this.prisma.fundingCall.findUnique({
      where: {id},
      include: {
        applications: {
          include: {
            project: {
              include: {institution: true, owner: {select: {id: true, email: true, fullName: true}}}
            }
          }
        }
      }
    });

    if (!call) {
      throw new NotFoundException('Funding call not found');
    }

    return call;
  }

  async createCall(userId: string, userRole: string, data: {title: string; description: string; deadline: Date}) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create funding calls');
    }

    return this.prisma.fundingCall.create({
      data: {
        title: data.title,
        description: data.description,
        deadline: new Date(data.deadline)
      }
    });
  }

  async submitApplication(fundingCallId: string, projectId: string, userId: string) {
    // Verify funding call exists and is active
    const call = await this.prisma.fundingCall.findUnique({
      where: {id: fundingCallId}
    });

    if (!call) {
      throw new NotFoundException('Funding call not found');
    }

    if (new Date(call.deadline) < new Date()) {
      throw new ForbiddenException('Funding call deadline has passed');
    }

    // Verify project access
    const project = await this.prisma.project.findUnique({
      where: {id: projectId}
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can submit applications');
    }

    // Check if already applied
    const existing = await this.prisma.application.findFirst({
      where: {fundingCallId, projectId}
    });

    if (existing) {
      throw new ForbiddenException('Application already submitted');
    }

    return this.prisma.application.create({
      data: {
        fundingCallId,
        projectId,
        status: 'SUBMITTED'
      },
      include: {
        fundingCall: true,
        project: {
          include: {institution: true, owner: {select: {id: true, email: true, fullName: true}}}
        }
      }
    });
  }

  async updateApplicationStatus(
    applicationId: string,
    userId: string,
    userRole: string,
    status: string
  ) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update application status');
    }

    return this.prisma.application.update({
      where: {id: applicationId},
      data: {status: status as any},
      include: {
        fundingCall: true,
        project: {
          include: {institution: true, owner: {select: {id: true, email: true, fullName: true}}}
        }
      }
    });
  }
}

