import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class PapersService {
  constructor(
    private prisma: PrismaService
  ) {}

  /**
   * Submit a new research paper
   */
  async createPaper(userId: string, data: {
    title: string;
    abstract: string;
    keywords?: string[];
    domainTags?: string[];
    projectId?: string;
    institutionId: string;
    content?: string;
    fileUrl?: string;
    s3Key?: string;
    contentType?: string;
    size?: number;
    nationalClassification?: string;
    orcidId?: string;
    scopusId?: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { institution: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify user belongs to the institution
    if (user.institutionId !== data.institutionId) {
      throw new ForbiddenException('User does not belong to the specified institution');
    }

    // AI-Assisted Metadata Tagging: Auto-generate keywords and domain tags if not provided
    let finalKeywords = data.keywords || [];
    let finalDomainTags = data.domainTags || [];
    
    if ((!data.keywords || data.keywords.length === 0) || (!data.domainTags || data.domainTags.length === 0)) {
      try {
        // AI metadata generation - placeholder
        const aiMetadata = { keywords: [], domains: [] };
        if (aiMetadata.keywords && aiMetadata.keywords.length > 0) {
          finalKeywords = [...new Set([...finalKeywords, ...aiMetadata.keywords])];
        }
        if (aiMetadata.domains && aiMetadata.domains.length > 0) {
          finalDomainTags = [...new Set([...finalDomainTags, ...aiMetadata.domains])];
        }
      } catch (error) {
        // If AI service fails, continue without AI-generated metadata
        console.warn('AI metadata generation failed, using provided metadata only:', error);
      }
    }

    // Create paper with initial version
    const paper = await this.prisma.paper.create({
      data: {
        title: data.title,
        abstract: data.abstract,
        keywords: finalKeywords,
        domainTags: finalDomainTags,
        projectId: data.projectId,
        institutionId: data.institutionId,
        createdById: userId,
        status: 'DRAFT',
        nationalClassification: data.nationalClassification,
        orcidId: data.orcidId,
        scopusId: data.scopusId,
        versions: {
          create: {
            version: 1,
            title: data.title,
            abstract: data.abstract,
            content: data.content,
            fileUrl: data.fileUrl,
            s3Key: data.s3Key,
            contentType: data.contentType,
            size: data.size,
            createdById: userId,
            changeLog: 'Initial version'
          }
        }
      },
      include: {
        versions: true,
        createdBy: true,
        institution: true,
        project: true
      }
    });

    // Set current version
    await this.prisma.paper.update({
      where: { id: paper.id },
      data: {
        currentVersionId: paper.versions[0].id
      }
    });

    return paper;
  }

  /**
   * Get all papers with filters
   */
  async getPapers(userId: string, filters?: {
    institutionId?: string;
    projectId?: string;
    status?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.institutionId) {
      where.institutionId = filters.institutionId;
    }

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { abstract: { contains: filters.search, mode: 'insensitive' } },
        { keywords: { has: filters.search } }
      ];
    }

    return this.prisma.paper.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true }
        },
        institution: {
          select: { id: true, name: true }
        },
        project: {
          select: { id: true, title: true }
        },
        currentVersion: true,
        _count: {
          select: {
            versions: true,
            peerReviews: true,
            citations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get paper by ID
   */
  async getPaperById(paperId: string, userId: string) {
    const paper = await this.prisma.paper.findUnique({
      where: { id: paperId },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true }
        },
        institution: {
          select: { id: true, name: true }
        },
        project: {
          select: { id: true, title: true }
        },
        versions: {
          orderBy: { version: 'desc' },
          include: {
            createdBy: {
              select: { id: true, fullName: true, email: true }
            }
          }
        },
        currentVersion: {
          include: {
            createdBy: {
              select: { id: true, fullName: true, email: true }
            }
          }
        },
        peerReviews: {
          include: {
            reviewer: {
              select: { id: true, fullName: true, email: true }
            }
          }
        },
        collaborators: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true }
            }
          }
        },
        citations: {
          include: {
            citedPaper: {
              select: { id: true, title: true }
            }
          }
        },
        citedBy: {
          include: {
            citingPaper: {
              select: { id: true, title: true }
            }
          }
        }
      }
    });

    if (!paper) {
      throw new NotFoundException('Paper not found');
    }

    // Check access permissions
    const hasAccess = await this.checkPaperAccess(paper, userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this paper');
    }

    return paper;
  }

  /**
   * Create a new version of a paper
   */
  async createVersion(paperId: string, userId: string, data: {
    title?: string;
    abstract?: string;
    content?: string;
    fileUrl?: string;
    s3Key?: string;
    contentType?: string;
    size?: number;
    changeLog?: string;
  }) {
    const paper = await this.prisma.paper.findUnique({
      where: { id: paperId },
      include: { 
        versions: true,
        collaborators: true,
        currentVersion: true
      }
    });

    if (!paper) {
      throw new NotFoundException('Paper not found');
    }

    // Check permissions
    const collaborators = await this.prisma.paperCollaborator.findMany({
      where: { paperId }
    });
    if (paper.createdById !== userId && !collaborators.some(c => c.userId === userId)) {
      throw new ForbiddenException('Only authors and collaborators can create versions');
    }

    const nextVersion = paper.versions.length + 1;
    const currentVersion = paper.currentVersion || paper.versions[paper.versions.length - 1];

    const version = await this.prisma.paperVersion.create({
      data: {
        paperId: paper.id,
        version: nextVersion,
        title: data.title || currentVersion.title,
        abstract: data.abstract || currentVersion.abstract,
        content: data.content || currentVersion.content,
        fileUrl: data.fileUrl || currentVersion.fileUrl,
        s3Key: data.s3Key || currentVersion.s3Key,
        contentType: data.contentType || currentVersion.contentType,
        size: data.size || currentVersion.size,
        changeLog: data.changeLog || `Version ${nextVersion}`,
        createdById: userId
      }
    });

    // Update current version
    await this.prisma.paper.update({
      where: { id: paperId },
      data: {
        currentVersionId: version.id,
        title: version.title,
        abstract: version.abstract
      }
    });

    return version;
  }

  /**
   * Submit paper for institutional review
   */
  async submitForReview(paperId: string, userId: string) {
    const paper = await this.prisma.paper.findUnique({
      where: { id: paperId }
    });

    if (!paper) {
      throw new NotFoundException('Paper not found');
    }

    if (paper.createdById !== userId) {
      throw new ForbiddenException('Only the paper creator can submit for review');
    }

    if (paper.status !== 'DRAFT') {
      throw new BadRequestException('Paper must be in DRAFT status to submit for review');
    }

    return this.prisma.paper.update({
      where: { id: paperId },
      data: {
        status: 'SUBMITTED',
        institutionalReviewStatus: 'PENDING'
      }
    });
  }

  /**
   * Institutional review action
   */
  async institutionalReview(paperId: string, reviewerId: string, action: {
    status: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
    comments?: string;
  }) {
    const paper = await this.prisma.paper.findUnique({
      where: { id: paperId },
      include: { institution: true }
    });

    if (!paper) {
      throw new NotFoundException('Paper not found');
    }

    // Verify reviewer belongs to the institution
    const reviewer = await this.prisma.user.findUnique({
      where: { id: reviewerId },
      include: { institution: true }
    });

    if (!reviewer || reviewer.institutionId !== paper.institutionId) {
      throw new ForbiddenException('Reviewer must belong to the paper\'s institution');
    }

    const updateData: any = {
      institutionalReviewStatus: action.status,
      institutionalReviewerId: reviewerId,
      institutionalReviewComments: action.comments
    };

    if (action.status === 'APPROVED') {
      updateData.status = 'APPROVED';
    } else if (action.status === 'REJECTED') {
      updateData.status = 'REJECTED';
    } else {
      updateData.status = 'DRAFT'; // Return to draft for revision
    }

    return this.prisma.paper.update({
      where: { id: paperId },
      data: updateData
    });
  }

  /**
   * Assign peer reviewer
   */
  async assignPeerReviewer(paperId: string, reviewerId: string, reviewType: 'INTERNAL' | 'EXTERNAL' | 'PEER', assignedBy: string) {
    const paper = await this.prisma.paper.findUnique({
      where: { id: paperId }
    });

    if (!paper) {
      throw new NotFoundException('Paper not found');
    }

    // Check if review already exists
    const existingReview = await this.prisma.paperReview.findUnique({
      where: {
        paperId_reviewerId_reviewType: {
          paperId,
          reviewerId,
          reviewType
        }
      }
    });

    if (existingReview) {
      throw new BadRequestException('Review already assigned to this reviewer');
    }

    return this.prisma.paperReview.create({
      data: {
        paperId,
        reviewerId,
        reviewType,
        status: 'PENDING'
      }
    });
  }

  /**
   * Submit peer review
   */
  async submitPeerReview(reviewId: string, reviewerId: string, data: {
    score?: number;
    comments?: string;
  }) {
    const review = await this.prisma.paperReview.findUnique({
      where: { id: reviewId },
      include: { paper: true }
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.reviewerId !== reviewerId) {
      throw new ForbiddenException('Only the assigned reviewer can submit this review');
    }

    return this.prisma.paperReview.update({
      where: { id: reviewId },
      data: {
        score: data.score,
        comments: data.comments,
        status: 'COMPLETED',
        submittedAt: new Date()
      }
    });
  }

  /**
   * Add collaborator
   */
  async addCollaborator(paperId: string, userId: string, collaboratorId: string, role: 'FIRST_AUTHOR' | 'CO_AUTHOR' | 'CORRESPONDING_AUTHOR' | 'CONTRIBUTOR', orcidId?: string) {
    const paper = await this.prisma.paper.findUnique({
      where: { id: paperId }
    });

    if (!paper) {
      throw new NotFoundException('Paper not found');
    }

    if (paper.createdById !== userId) {
      throw new ForbiddenException('Only the paper creator can add collaborators');
    }

    return this.prisma.paperCollaborator.create({
      data: {
        paperId,
        userId: collaboratorId,
        role,
        orcidId
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });
  }

  /**
   * Add citation
   */
  async addCitation(paperId: string, citedPaperId: string, citationType: 'REFERENCE' | 'IN_TEXT' | 'FOOTNOTE', context?: string) {
    const paper = await this.prisma.paper.findUnique({
      where: { id: paperId }
    });

    if (!paper) {
      throw new NotFoundException('Paper not found');
    }

    const citedPaper = await this.prisma.paper.findUnique({
      where: { id: citedPaperId }
    });

    if (!citedPaper) {
      throw new NotFoundException('Cited paper not found');
    }

    return this.prisma.paperCitation.create({
      data: {
        citingPaperId: paperId,
        citedPaperId,
        citationType,
        context
      }
    });
  }

  /**
   * Update paper metadata (DOI, ORCID, Scopus)
   */
  async updateMetadata(paperId: string, userId: string, data: {
    doi?: string;
    orcidId?: string;
    scopusId?: string;
    nationalClassification?: string;
  }) {
    const paper = await this.prisma.paper.findUnique({
      where: { id: paperId }
    });

    if (!paper) {
      throw new NotFoundException('Paper not found');
    }

    if (paper.createdById !== userId) {
      throw new ForbiddenException('Only the paper creator can update metadata');
    }

    return this.prisma.paper.update({
      where: { id: paperId },
      data
    });
  }

  /**
   * Update impact analytics
   */
  async updateImpactMetrics(paperId: string, metrics: {
    downloadCount?: number;
    citationCount?: number;
    viewCount?: number;
  }) {
    return this.prisma.paper.update({
      where: { id: paperId },
      data: {
        downloadCount: metrics.downloadCount,
        citationCount: metrics.citationCount,
        viewCount: metrics.viewCount
      }
    });
  }

  /**
   * Record plagiarism check
   */
  async recordPlagiarismCheck(paperId: string, score: number, report: any) {
    return this.prisma.paper.update({
      where: { id: paperId },
      data: {
        plagiarismScore: score,
        plagiarismReport: report,
        plagiarismCheckedAt: new Date()
      }
    });
  }

  /**
   * Share paper with user or institution
   */
  async sharePaper(paperId: string, userId: string, data: {
    sharedWithUserId?: string;
    sharedWithInstitutionId?: string;
    permission: 'VIEW' | 'EDIT' | 'REVIEW' | 'ADMIN';
  }) {
    const paper = await this.prisma.paper.findUnique({
      where: { id: paperId }
    });

    if (!paper) {
      throw new NotFoundException('Paper not found');
    }

    if (paper.createdById !== userId) {
      throw new ForbiddenException('Only the paper creator can share the paper');
    }

    return this.prisma.paperShare.create({
      data: {
        paperId,
        sharedWithUserId: data.sharedWithUserId,
        sharedWithInstitutionId: data.sharedWithInstitutionId,
        permission: data.permission
      }
    });
  }

  /**
   * Archive paper
   */
  async archivePaper(paperId: string, userId: string) {
    const paper = await this.prisma.paper.findUnique({
      where: { id: paperId }
    });

    if (!paper) {
      throw new NotFoundException('Paper not found');
    }

    // Only creator or institution admin can archive
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (paper.createdById !== userId && user?.role !== 'ADMIN' && user?.role !== 'INSTITUTION_ADMIN') {
      throw new ForbiddenException('Only the paper creator or admin can archive the paper');
    }

    return this.prisma.paper.update({
      where: { id: paperId },
      data: {
        archived: true,
        archivedAt: new Date(),
        status: 'ARCHIVED'
      }
    });
  }

  /**
   * Check paper access permissions
   */
  private async checkPaperAccess(paper: any, userId: string): Promise<boolean> {
    // Creator always has access
    if (paper.createdById === userId) {
      return true;
    }

    // Check if user is a collaborator
    if (paper.collaborators) {
      const isCollaborator = paper.collaborators.some((c: any) => c.userId === userId);
      if (isCollaborator) {
        return true;
      }
    }

    // Check shared access
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { institution: true }
    });

    if (user) {
      const hasSharedAccess = await this.prisma.paperShare.findFirst({
        where: {
          paperId: paper.id,
          OR: [
            { sharedWithUserId: userId },
            { sharedWithInstitutionId: user.institutionId }
          ]
        }
      });

      if (hasSharedAccess) {
        return true;
      }
    }

    // Check access level
    if (paper.accessLevel === 'PUBLIC') {
      return true;
    }

    if (paper.accessLevel === 'INSTITUTION' && user?.institutionId === paper.institutionId) {
      return true;
    }

    return false;
  }
}

