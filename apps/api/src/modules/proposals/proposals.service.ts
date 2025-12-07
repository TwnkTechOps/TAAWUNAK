import {Injectable, ForbiddenException, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../../services/prisma.service';

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) {}

  async list(userId?: string, userRole?: string) {
    if (userRole === 'ADMIN') {
      return this.prisma.proposal.findMany({
        include: {
          project: {
            include: {institution: true, owner: {select: {id: true, email: true, fullName: true}}}
          },
          reviews: {
            include: {reviewer: {select: {id: true, email: true, fullName: true}}}
          },
          _count: {select: {reviews: true}}
        },
        orderBy: {createdAt: 'desc'}
      });
    }

    if (userId) {
      return this.prisma.proposal.findMany({
        where: {
          project: {
            OR: [
              {ownerId: userId},
              {participants: {some: {userId, status: 'ACTIVE'}}}
            ]
          }
        },
        include: {
          project: {
            include: {institution: true, owner: {select: {id: true, email: true, fullName: true}}}
          },
          reviews: {
            include: {reviewer: {select: {id: true, email: true, fullName: true}}}
          },
          _count: {select: {reviews: true}}
        },
        orderBy: {createdAt: 'desc'}
      });
    }

    return [];
  }

  async getById(id: string, userId?: string, userRole?: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: {id},
      include: {
        project: {
          include: {
            institution: true,
            owner: {select: {id: true, email: true, fullName: true}},
            participants: {
              include: {user: {select: {id: true, email: true, fullName: true}}}
            }
          }
        },
        reviews: {
          include: {reviewer: {select: {id: true, email: true, fullName: true}}},
          orderBy: {createdAt: 'desc'}
        }
      }
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // Check access
    if (userRole !== 'ADMIN') {
      const isOwner = proposal.project.ownerId === userId;
      const isParticipant = (proposal.project as any).participants?.some(
        (p: any) => p.userId === userId && p.status === 'ACTIVE'
      );
      if (!isOwner && !isParticipant && userRole !== 'REVIEWER') {
        throw new ForbiddenException('Access denied');
      }
    }

    return proposal;
  }

  async create(projectId: string, userId: string, data: {content: string; trl: number; strategicAlignment?: string[]}) {
    // Verify project access
    const project = await this.prisma.project.findUnique({
      where: {id: projectId},
      include: {
        participants: {
          where: {userId, status: 'ACTIVE'}
        }
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isOwner = project.ownerId === userId;
    const isParticipant = (project as any).participants?.length > 0;

    if (!isOwner && !isParticipant) {
      throw new ForbiddenException('Only project owners or participants can create proposals');
    }

    return this.prisma.proposal.create({
      data: {
        projectId,
        content: data.content,
        trl: data.trl,
        strategicAlignment: data.strategicAlignment || [],
        status: 'SUBMITTED'
      },
      include: {
        project: {
          include: {institution: true, owner: {select: {id: true, email: true, fullName: true}}}
        }
      }
    });
  }

  async update(id: string, userId: string, userRole: string, data: {content?: string; trl?: number; status?: string}) {
    const proposal = await this.getById(id, userId, userRole);
    
    // Only owner or admin can update
    if (proposal.project.ownerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only proposal owner or admin can update');
    }

    return this.prisma.proposal.update({
      where: {id},
      data: {
        content: data.content,
        trl: data.trl,
        status: data.status as any
      },
      include: {
        project: {
          include: {institution: true, owner: {select: {id: true, email: true, fullName: true}}}
        },
        reviews: {
          include: {reviewer: {select: {id: true, email: true, fullName: true}}}
        }
      }
    });
  }

  async submitReview(proposalId: string, reviewerId: string, data: {score: number; comments?: string}) {
    const proposal = await this.prisma.proposal.findUnique({
      where: {id: proposalId}
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // Check if already reviewed by this reviewer
    const existingReview = await this.prisma.review.findFirst({
      where: {proposalId, reviewerId}
    });

    if (existingReview) {
      return this.prisma.review.update({
        where: {id: existingReview.id},
        data: {
          score: data.score,
          comments: data.comments
        },
        include: {reviewer: {select: {id: true, email: true, fullName: true}}}
      });
    }

    return this.prisma.review.create({
      data: {
        proposalId,
        reviewerId,
        score: data.score,
        comments: data.comments
      },
      include: {reviewer: {select: {id: true, email: true, fullName: true}}}
    });
  }

  async listPublic(limit = 50) {
    return this.prisma.proposal.findMany({
      where: {
        isPublic: true
      },
      include: {
        project: {
          include: {
            institution: true,
            owner: {select: {id: true, email: true, fullName: true}}
          }
        },
        evaluation: true,
        _count: {
          select: {
            enterpriseInterests: true,
            matches: true
          }
        }
      },
      orderBy: {
        tierScore: 'desc'
      },
      take: limit
    });
  }

  async getEvaluation(proposalId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: {id: proposalId},
      include: {
        evaluation: true
      }
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    return proposal.evaluation || null;
  }

  async saveEvaluation(proposalId: string, evaluation: any) {
    const proposal = await this.prisma.proposal.findUnique({
      where: {id: proposalId}
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // Update proposal with scores
    await this.prisma.proposal.update({
      where: {id: proposalId},
      data: {
        overallScore: evaluation.overallScore,
        qualityScore: evaluation.qualityScore,
        innovationScore: evaluation.innovationScore,
        feasibilityScore: evaluation.feasibilityScore,
        evaluatedAt: new Date(),
        evaluatedBy: evaluation.method || 'system'
      }
    });

    // Create or update evaluation record
    return this.prisma.proposalEvaluation.upsert({
      where: {proposalId},
      create: {
        proposalId,
        overallScore: evaluation.overallScore,
        qualityScore: evaluation.qualityScore,
        innovationScore: evaluation.innovationScore,
        feasibilityScore: evaluation.feasibilityScore,
        alignmentScore: evaluation.alignmentScore || 0,
        tier: proposal.tier || 'TIER_4',
        evaluationMethod: evaluation.method || 'rule-based',
        factors: evaluation.factors || {},
        suggestions: evaluation.suggestions || [],
        checklist: evaluation.checklist || {},
        evaluatedBy: evaluation.method || 'system'
      },
      update: {
        overallScore: evaluation.overallScore,
        qualityScore: evaluation.qualityScore,
        innovationScore: evaluation.innovationScore,
        feasibilityScore: evaluation.feasibilityScore,
        alignmentScore: evaluation.alignmentScore || 0,
        factors: evaluation.factors || {},
        suggestions: evaluation.suggestions || [],
        checklist: evaluation.checklist || {},
        evaluatedAt: new Date()
      }
    });
  }

  async expressInterest(proposalId: string, institutionId: string, data: {interestLevel: string; feedback?: string}) {
    if (!institutionId) {
      throw new ForbiddenException('Enterprise institution required');
    }

    return this.prisma.enterpriseInterest.upsert({
      where: {
        proposalId_institutionId: {
          proposalId,
          institutionId
        }
      },
      create: {
        proposalId,
        institutionId,
        interestLevel: data.interestLevel as any,
        feedback: data.feedback,
        status: 'EXPRESSED'
      },
      update: {
        interestLevel: data.interestLevel as any,
        feedback: data.feedback,
        updatedAt: new Date()
      },
      include: {
        institution: true
      }
    });
  }
}
