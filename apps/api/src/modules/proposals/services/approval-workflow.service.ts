import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { ApprovalLevel, ApprovalStatus, ProposalStatus } from '@prisma/client';

@Injectable()
export class ApprovalWorkflowService {
  constructor(private prisma: PrismaService) {}

  /**
   * Initialize approval workflow for a proposal
   */
  async initializeWorkflow(proposalId: string): Promise<void> {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId }
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // Create approval records for each level
    const levels = [
      ApprovalLevel.INSTITUTIONAL_ADMIN,
      ApprovalLevel.MINISTRY,
      ApprovalLevel.INDUSTRY_SELECTION
    ];

    for (const level of levels) {
      await this.prisma.proposalApproval.upsert({
        where: {
          proposalId_level: {
            proposalId,
            level
          }
        },
        create: {
          proposalId,
          level,
          status: ApprovalStatus.PENDING
        },
        update: {} // Don't update if exists
      });
    }
  }

  /**
   * Approve at a specific level
   */
  async approve(
    proposalId: string,
    level: ApprovalLevel,
    approverId: string,
    comments?: string
  ): Promise<void> {
    const approval = await this.prisma.proposalApproval.findUnique({
      where: {
        proposalId_level: {
          proposalId,
          level
        }
      }
    });

    if (!approval) {
      throw new NotFoundException('Approval record not found');
    }

    if (approval.status === ApprovalStatus.APPROVED) {
      throw new BadRequestException('Already approved at this level');
    }

    // Update approval
    await this.prisma.proposalApproval.update({
      where: {
        proposalId_level: {
          proposalId,
          level
        }
      },
      data: {
        status: ApprovalStatus.APPROVED,
        approverId,
        comments,
        approvedAt: new Date()
      }
    });

    // Update proposal status based on approval level
    await this.updateProposalStatus(proposalId, level, ApprovalStatus.APPROVED);
  }

  /**
   * Reject at a specific level
   */
  async reject(
    proposalId: string,
    level: ApprovalLevel,
    approverId: string,
    comments: string
  ): Promise<void> {
    const approval = await this.prisma.proposalApproval.findUnique({
      where: {
        proposalId_level: {
          proposalId,
          level
        }
      }
    });

    if (!approval) {
      throw new NotFoundException('Approval record not found');
    }

    if (!comments) {
      throw new BadRequestException('Comments are required for rejection');
    }

    // Update approval
    await this.prisma.proposalApproval.update({
      where: {
        proposalId_level: {
          proposalId,
          level
        }
      },
      data: {
        status: ApprovalStatus.REJECTED,
        approverId,
        comments
      }
    });

    // Update proposal status
    await this.updateProposalStatus(proposalId, level, ApprovalStatus.REJECTED);
  }

  /**
   * Request revision at a specific level
   */
  async requestRevision(
    proposalId: string,
    level: ApprovalLevel,
    approverId: string,
    comments: string
  ): Promise<void> {
    const approval = await this.prisma.proposalApproval.findUnique({
      where: {
        proposalId_level: {
          proposalId,
          level
        }
      }
    });

    if (!approval) {
      throw new NotFoundException('Approval record not found');
    }

    if (!comments) {
      throw new BadRequestException('Comments are required for revision request');
    }

    // Update approval
    await this.prisma.proposalApproval.update({
      where: {
        proposalId_level: {
          proposalId,
          level
        }
      },
      data: {
        status: ApprovalStatus.REVISION_REQUESTED,
        approverId,
        comments
      }
    });

    // Update proposal status
    await this.prisma.proposal.update({
      where: { id: proposalId },
      data: {
        status: ProposalStatus.UNDER_REVIEW
      }
    });
  }

  /**
   * Update proposal status based on approval level and status
   */
  private async updateProposalStatus(
    proposalId: string,
    level: ApprovalLevel,
    approvalStatus: ApprovalStatus
  ): Promise<void> {
    if (approvalStatus === ApprovalStatus.REJECTED) {
      await this.prisma.proposal.update({
        where: { id: proposalId },
        data: { status: ProposalStatus.REJECTED }
      });
      return;
    }

    if (approvalStatus === ApprovalStatus.APPROVED) {
      let newStatus: ProposalStatus;

      switch (level) {
        case ApprovalLevel.INSTITUTIONAL_ADMIN:
          newStatus = ProposalStatus.INSTITUTIONAL_APPROVAL;
          break;
        case ApprovalLevel.MINISTRY:
          newStatus = ProposalStatus.MINISTRY_REVIEW;
          break;
        case ApprovalLevel.INDUSTRY_SELECTION:
          newStatus = ProposalStatus.APPROVED;
          // Make proposal public for enterprise browsing
          await this.prisma.proposal.update({
            where: { id: proposalId },
            data: { isPublic: true }
          });
          break;
        default:
          return;
      }

      await this.prisma.proposal.update({
        where: { id: proposalId },
        data: { status: newStatus }
      });
    }
  }

  /**
   * Get approval workflow status for a proposal
   */
  async getWorkflowStatus(proposalId: string) {
    const approvals = await this.prisma.proposalApproval.findMany({
      where: { proposalId },
      include: {
        approver: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      },
      orderBy: {
        level: 'asc'
      }
    });

    return {
      proposalId,
      approvals,
      currentLevel: this.getCurrentLevel(approvals),
      isComplete: approvals.every(
        a => a.status === ApprovalStatus.APPROVED || a.status === ApprovalStatus.REJECTED
      ),
      isApproved: approvals.every(a => a.status === ApprovalStatus.APPROVED)
    };
  }

  /**
   * Get current approval level
   */
  private getCurrentLevel(approvals: any[]): ApprovalLevel | null {
    // Find the first pending or revision requested approval
    const pending = approvals.find(
      a => a.status === ApprovalStatus.PENDING || a.status === ApprovalStatus.REVISION_REQUESTED
    );
    return pending ? pending.level : null;
  }

  /**
   * Get proposals pending approval at a specific level
   */
  async getPendingApprovals(level: ApprovalLevel, limit = 50) {
    return this.prisma.proposalApproval.findMany({
      where: {
        level,
        status: ApprovalStatus.PENDING
      },
      include: {
        proposal: {
          include: {
            project: {
              include: {
                institution: true,
                owner: {
                  select: {
                    id: true,
                    email: true,
                    fullName: true
                  }
                }
              }
            },
            evaluation: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: limit
    });
  }

  /**
   * Get approval statistics
   */
  async getApprovalStatistics() {
    const [pending, approved, rejected, revisionRequested] = await Promise.all([
      this.prisma.proposalApproval.count({ where: { status: ApprovalStatus.PENDING } }),
      this.prisma.proposalApproval.count({ where: { status: ApprovalStatus.APPROVED } }),
      this.prisma.proposalApproval.count({ where: { status: ApprovalStatus.REJECTED } }),
      this.prisma.proposalApproval.count({ where: { status: ApprovalStatus.REVISION_REQUESTED } })
    ]);

    const total = pending + approved + rejected + revisionRequested;

    return {
      pending,
      approved,
      rejected,
      revisionRequested,
      total,
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0',
      rejectionRate: total > 0 ? ((rejected / total) * 100).toFixed(1) : '0.0'
    };
  }
}

