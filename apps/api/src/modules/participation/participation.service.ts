import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class ParticipationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get or create participation quota for institution
   */
  async getOrCreateQuota(institutionId: string) {
    let quota = await this.prisma.participationQuota.findUnique({
      where: { institutionId },
      include: {
        genderQuota: true,
        institution: true
      }
    });

    if (!quota) {
      // Determine tier based on institution type
      const institution = await this.prisma.institution.findUnique({
        where: { id: institutionId }
      });

      if (!institution) {
        throw new NotFoundException('Institution not found');
      }

      const tier = this.determineTier(institution.type);

      quota = await this.prisma.participationQuota.create({
        data: {
          institutionId,
          tier,
          totalQuota: 0,
          usedQuota: 0,
          availableQuota: 0,
          genderQuota: {
            create: {
              maleQuota: 0,
              femaleQuota: 0,
              otherQuota: 0,
              maleUsed: 0,
              femaleUsed: 0,
              otherUsed: 0
            }
          }
        },
        include: {
          genderQuota: true,
          institution: true
        }
      });
    }

    return quota;
  }

  /**
   * Update participation quota
   */
  async updateQuota(institutionId: string, updatedBy: string, data: {
    totalQuota?: number;
    skillAreas?: string[];
    maleQuota?: number;
    femaleQuota?: number;
    otherQuota?: number;
  }) {
    const quota = await this.getOrCreateQuota(institutionId);

    const updateData: any = {
      lastUpdatedBy: updatedBy,
      lastUpdatedAt: new Date()
    };

    if (data.totalQuota !== undefined) {
      updateData.totalQuota = data.totalQuota;
      updateData.availableQuota = data.totalQuota - quota.usedQuota;
    }

    if (data.skillAreas !== undefined) {
      updateData.skillAreas = data.skillAreas;
    }

    const updatedQuota = await this.prisma.participationQuota.update({
      where: { id: quota.id },
      data: updateData,
      include: {
        genderQuota: true
      }
    });

    // Update gender quota if provided
    if (data.maleQuota !== undefined || data.femaleQuota !== undefined || data.otherQuota !== undefined) {
      const genderUpdate: any = {};
      if (data.maleQuota !== undefined) genderUpdate.maleQuota = data.maleQuota;
      if (data.femaleQuota !== undefined) genderUpdate.femaleQuota = data.femaleQuota;
      if (data.otherQuota !== undefined) genderUpdate.otherQuota = data.otherQuota;

      await this.prisma.genderQuota.update({
        where: { participationQuotaId: quota.id },
        data: genderUpdate
      });
    }

    return this.getOrCreateQuota(institutionId);
  }

  /**
   * Get all participants
   */
  async getParticipants(filters?: {
    institutionId?: string;
    projectId?: string;
    status?: string;
    gender?: string;
    skillArea?: string;
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

    if (filters?.gender) {
      where.gender = filters.gender;
    }

    if (filters?.skillArea) {
      where.skillArea = filters.skillArea;
    }

    return this.prisma.rDParticipant.findMany({
      where,
      include: {
        user: {
          select: { id: true, fullName: true, email: true }
        },
        institution: {
          select: { id: true, name: true, type: true }
        },
        project: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Add participant
   */
  async addParticipant(institutionId: string, userId: string, data: {
    projectId?: string;
    role: 'OWNER' | 'COLLABORATOR' | 'REVIEWER' | 'VIEWER';
    skillArea?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  }) {
    // Check quota availability
    const quota = await this.getOrCreateQuota(institutionId);
    if (!quota) {
      throw new NotFoundException('Quota not found');
    }

    if (quota.usedQuota >= quota.totalQuota) {
      throw new BadRequestException('Participation quota exhausted');
    }

    // Check gender quota if gender is specified
    if (data.gender && quota.genderQuota) {
      const genderQuota = quota.genderQuota;
      if (data.gender === 'MALE' && genderQuota.maleUsed >= genderQuota.maleQuota) {
        throw new BadRequestException('Male participation quota exhausted');
      }
      if (data.gender === 'FEMALE' && genderQuota.femaleUsed >= genderQuota.femaleQuota) {
        throw new BadRequestException('Female participation quota exhausted');
      }
      if (data.gender === 'OTHER' && genderQuota.otherUsed >= genderQuota.otherQuota) {
        throw new BadRequestException('Other gender participation quota exhausted');
      }
    }

    // Create participant
    const participant = await this.prisma.rDParticipant.create({
      data: {
        institutionId,
        userId,
        projectId: data.projectId,
        role: data.role,
        skillArea: data.skillArea,
        gender: data.gender
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true }
        },
        institution: true,
        project: true
      }
    });

    // Update quota usage
    await this.prisma.participationQuota.update({
      where: { id: quota.id },
      data: {
        usedQuota: quota.usedQuota + 1,
        availableQuota: quota.availableQuota - 1
      }
    });

    // Update gender quota if gender is specified
    if (data.gender && quota.genderQuota) {
      const genderUpdate: any = {};
      if (data.gender === 'MALE') {
        genderUpdate.maleUsed = { increment: 1 };
      } else if (data.gender === 'FEMALE') {
        genderUpdate.femaleUsed = { increment: 1 };
      } else if (data.gender === 'OTHER') {
        genderUpdate.otherUsed = { increment: 1 };
      }

      await this.prisma.genderQuota.update({
        where: { participationQuotaId: quota.id },
        data: genderUpdate
      });
    }

    return participant;
  }

  /**
   * Remove participant
   */
  async removeParticipant(participantId: string, institutionId: string) {
    const participant = await this.prisma.rDParticipant.findUnique({
      where: { id: participantId },
      include: {
        institution: true
      }
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    if (participant.institutionId !== institutionId) {
      throw new ForbiddenException('Cannot remove participant from different institution');
    }

    // Update quota
    const quota = await this.getOrCreateQuota(institutionId);
    if (!quota) {
      throw new NotFoundException('Quota not found');
    }
    
    await this.prisma.participationQuota.update({
      where: { id: quota.id },
      data: {
        usedQuota: quota.usedQuota - 1,
        availableQuota: quota.availableQuota + 1
      }
    });

    // Update gender quota if gender was specified
    if (participant.gender && quota.genderQuota) {
      const genderUpdate: any = {};
      if (participant.gender === 'MALE') {
        genderUpdate.maleUsed = { decrement: 1 };
      } else if (participant.gender === 'FEMALE') {
        genderUpdate.femaleUsed = { decrement: 1 };
      } else if (participant.gender === 'OTHER') {
        genderUpdate.otherUsed = { decrement: 1 };
      }

      await this.prisma.genderQuota.update({
        where: { participationQuotaId: quota.id },
        data: genderUpdate
      });
    }

    return this.prisma.rDParticipant.delete({
      where: { id: participantId }
    });
  }

  /**
   * Send invitation to lower-tier institution
   */
  async sendInvitation(institutionId: string, invitedBy: string, data: {
    invitedInstitutionId: string;
    projectId?: string;
    skillAreas: string[];
    quotaAllocated?: number;
    message?: string;
  }) {
    const invitingInstitution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      include: { participationQuota: true }
    });

    if (!invitingInstitution) {
      throw new NotFoundException('Institution not found');
    }

    const invitedInstitution = await this.prisma.institution.findUnique({
      where: { id: data.invitedInstitutionId }
    });

    if (!invitedInstitution) {
      throw new NotFoundException('Invited institution not found');
    }

    // Verify tier hierarchy (higher tier can invite lower tier)
    const invitingTier = this.determineTier(invitingInstitution.type);
    const invitedTier = this.determineTier(invitedInstitution.type);

    if (invitedTier >= invitingTier) {
      throw new BadRequestException('Can only invite institutions from lower tiers');
    }

    return this.prisma.rDParticipantInvitation.create({
      data: {
        institutionId,
        invitedInstitutionId: data.invitedInstitutionId,
        projectId: data.projectId,
        skillAreas: data.skillAreas,
        quotaAllocated: data.quotaAllocated,
        message: data.message,
        invitedBy,
        status: 'PENDING'
      },
      include: {
        institution: {
          select: { id: true, name: true, type: true }
        },
        invitedInstitution: {
          select: { id: true, name: true, type: true }
        },
        project: {
          select: { id: true, title: true }
        },
        invitedByUser: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });
  }

  /**
   * Respond to invitation
   */
  async respondToInvitation(invitationId: string, institutionId: string, response: 'ACCEPTED' | 'DECLINED') {
    const invitation = await this.prisma.rDParticipantInvitation.findUnique({
      where: { id: invitationId }
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.invitedInstitutionId !== institutionId) {
      throw new ForbiddenException('Only the invited institution can respond');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Invitation already responded to');
    }

    return this.prisma.rDParticipantInvitation.update({
      where: { id: invitationId },
      data: {
        status: response,
        respondedAt: new Date()
      }
    });
  }

  /**
   * Get participation analytics
   */
  async getAnalytics(filters?: {
    institutionId?: string;
    tier?: string;
  }) {
    const where: any = {};

    if (filters?.institutionId) {
      where.institutionId = filters.institutionId;
    }

    if (filters?.tier) {
      where.tier = filters.tier;
    }

    const quotas = await this.prisma.participationQuota.findMany({
      where,
      include: {
        institution: {
          select: { id: true, name: true, type: true }
        },
        genderQuota: true
      }
    });

    const participants = await this.prisma.rDParticipant.findMany({
      where: filters?.institutionId ? { institutionId: filters.institutionId } : {},
      select: {
        id: true,
        gender: true
      }
    });

    // Calculate gender distribution
    const genderStats = {
      MALE: participants.filter(p => p.gender === 'MALE').length,
      FEMALE: participants.filter(p => p.gender === 'FEMALE').length,
      OTHER: participants.filter(p => p.gender === 'OTHER').length,
      PREFER_NOT_TO_SAY: participants.filter(p => p.gender === 'PREFER_NOT_TO_SAY').length
    };

    // Calculate tier distribution
    const tierStats = (quotas as any[]).reduce((acc, quota) => {
      acc[quota.tier] = (acc[quota.tier] || 0) + (quota.participants || []).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalQuotas: quotas.length,
      totalParticipants: participants.length,
      quotaUtilization: (quotas as any[]).map(q => ({
        institutionId: q.institutionId,
        institutionName: q.institution?.name || 'Unknown',
        tier: q.tier,
        totalQuota: q.totalQuota,
        usedQuota: q.usedQuota,
        availableQuota: q.availableQuota,
        utilizationRate: q.totalQuota > 0 ? (q.usedQuota / q.totalQuota) * 100 : 0
      })),
      genderDistribution: genderStats,
      tierDistribution: tierStats,
      quotas
    };
  }

  /**
   * Get suggested projects for institution based on quota and skills
   */
  async getSuggestedProjects(institutionId: string) {
    const quota = await this.getOrCreateQuota(institutionId);

    if (quota.availableQuota === 0) {
      return [];
    }

    // Find projects that match skill areas and have available slots
    const projects = await this.prisma.project.findMany({
      where: {
        status: 'ACTIVE',
        // Add skill area matching logic here if projects have skill requirements
      },
      include: {
        institution: {
          select: { id: true, name: true, type: true }
        },
        _count: {
          select: {
            rdParticipants: true
          }
        }
      },
      take: 10
    });

    return projects.filter(p => {
      // Filter based on tier compatibility and available quota
      const projectInstitutionTier = this.determineTier(p.institution.type);
      const quotaTier = quota.tier;

      // Lower tier institutions can join higher tier projects
      return quotaTier <= projectInstitutionTier;
    });
  }

  /**
   * Determine participation tier from institution type
   */
  private determineTier(institutionType: string): 'TIER_1_UNIVERSITY' | 'TIER_2_TECHNICAL_COLLEGE' | 'TIER_3_VOCATIONAL_SCHOOL' | 'TIER_4_SECONDARY_SCHOOL' {
    const tierMap: Record<string, 'TIER_1_UNIVERSITY' | 'TIER_2_TECHNICAL_COLLEGE' | 'TIER_3_VOCATIONAL_SCHOOL' | 'TIER_4_SECONDARY_SCHOOL'> = {
      'UNIVERSITY': 'TIER_1_UNIVERSITY',
      'TECHNICAL_COLLEGE': 'TIER_2_TECHNICAL_COLLEGE',
      'VOCATIONAL_SCHOOL': 'TIER_3_VOCATIONAL_SCHOOL',
      'SECONDARY_SCHOOL': 'TIER_4_SECONDARY_SCHOOL',
      'RESEARCH_CENTER': 'TIER_1_UNIVERSITY',
      'COMPANY': 'TIER_1_UNIVERSITY',
      'SCHOOL': 'TIER_4_SECONDARY_SCHOOL'
    };

    return tierMap[institutionType] || 'TIER_4_SECONDARY_SCHOOL';
  }

  /**
   * Ministry-Level Oversight: Get all quotas across all institutions
   */
  async getMinistryOverview(filters?: {
    tier?: string;
    region?: string;
  }) {
    const where: any = {};

    if (filters?.tier) {
      where.tier = filters.tier;
    }

    const quotas = await this.prisma.participationQuota.findMany({
      where,
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        genderQuota: true
      }
    });

    const participants = await this.prisma.rDParticipant.findMany({
      include: {
        institution: {
          select: { id: true, name: true, type: true }
        },
        project: {
          select: { id: true, title: true }
        }
      }
    });

    // Aggregate statistics
    const totalQuota = quotas.reduce((sum, q) => sum + q.totalQuota, 0);
    const totalUsed = quotas.reduce((sum, q) => sum + q.usedQuota, 0);
    const totalAvailable = quotas.reduce((sum, q) => sum + q.availableQuota, 0);

    // Gender statistics
    const genderStats = {
      male: participants.filter(p => p.gender === 'MALE').length,
      female: participants.filter(p => p.gender === 'FEMALE').length,
      other: participants.filter(p => p.gender === 'OTHER').length,
      preferNotToSay: participants.filter(p => p.gender === 'PREFER_NOT_TO_SAY').length
    };

    // Tier distribution
    const tierDistribution = (quotas as any[]).reduce((acc, quota) => {
      acc[quota.tier] = (acc[quota.tier] || 0) + ((quota.participants || []).length || (quota._count?.participants || 0));
      return acc;
    }, {} as Record<string, number>);

    // Institution type distribution
    const institutionDistribution = (quotas as any[]).reduce((acc, quota) => {
      const type = quota.institution?.type || 'Unknown';
      acc[type] = (acc[type] || 0) + (quota._count?.participants || 0);
      return acc;
    }, {} as Record<string, number>);

    return {
      summary: {
        totalInstitutions: quotas.length,
        totalQuota,
        totalUsed,
        totalAvailable,
        utilizationRate: totalQuota > 0 ? (totalUsed / totalQuota) * 100 : 0,
        totalParticipants: participants.length
      },
      genderDistribution: genderStats,
      tierDistribution,
      institutionDistribution,
      quotas: (quotas as any[]).map(q => ({
        institutionId: q.institutionId,
        institutionName: q.institution?.name || 'Unknown',
        institutionType: q.institution?.type || 'Unknown',
        tier: q.tier,
        totalQuota: q.totalQuota,
        usedQuota: q.usedQuota,
        availableQuota: q.availableQuota,
        utilizationRate: q.totalQuota > 0 ? (q.usedQuota / q.totalQuota) * 100 : 0,
        participantCount: (q.participants || []).length || (q._count?.participants || 0),
        genderQuota: q.genderQuota
      }))
    };
  }

  /**
   * Ministry-Level Oversight: Update quota for any institution
   */
  async updateMinistryQuota(institutionId: string, updatedBy: string, data: {
    totalQuota?: number;
    skillAreas?: string[];
    maleQuota?: number;
    femaleQuota?: number;
    otherQuota?: number;
  }) {
    // Verify user has ministry/admin privileges (should be checked in controller)
    return this.updateQuota(institutionId, updatedBy, data);
  }

  /**
   * Generate Inclusive Reporting: National reports on education-to-innovation engagement
   */
  async generateInclusiveReport(filters?: {
    startDate?: Date;
    endDate?: Date;
    tier?: string;
    region?: string;
  }) {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    if (filters?.tier) {
      where.tier = filters.tier;
    }

    const quotas = await this.prisma.participationQuota.findMany({
      where,
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        genderQuota: true,
      }
    });

    const invitations = await this.prisma.rDParticipantInvitation.findMany({
      where: filters?.startDate || filters?.endDate ? {
        createdAt: {
          gte: filters.startDate,
          lte: filters.endDate
        }
      } : {},
      include: {
        institution: {
          select: { id: true, name: true, type: true }
        },
        invitedInstitution: {
          select: { id: true, name: true, type: true }
        },
        project: {
          select: { id: true, title: true }
        }
      }
    });

    // Calculate metrics
    const totalInstitutions = quotas.length;
    const totalParticipants = (quotas as any[]).reduce((sum, q) => sum + (q.participants || []).length, 0);
    const totalInvitations = invitations.length;
    const acceptedInvitations = invitations.filter(i => i.status === 'ACCEPTED').length;
    const invitationAcceptanceRate = totalInvitations > 0 ? (acceptedInvitations / totalInvitations) * 100 : 0;

    // Gender equality metrics
    const genderMetrics = {
      male: {
        total: (quotas as any[]).reduce((sum, q) => sum + (q.genderQuota?.maleQuota || 0), 0),
        used: (quotas as any[]).reduce((sum, q) => sum + (q.genderQuota?.maleUsed || 0), 0)
      },
      female: {
        total: (quotas as any[]).reduce((sum, q) => sum + (q.genderQuota?.femaleQuota || 0), 0),
        used: (quotas as any[]).reduce((sum, q) => sum + (q.genderQuota?.femaleUsed || 0), 0)
      },
      other: {
        total: (quotas as any[]).reduce((sum, q) => sum + (q.genderQuota?.otherQuota || 0), 0),
        used: (quotas as any[]).reduce((sum, q) => sum + (q.genderQuota?.otherUsed || 0), 0)
      }
    };

    // Tier engagement metrics
    const tierEngagement = (quotas as any[]).reduce((acc, quota) => {
      if (!acc[quota.tier]) {
        acc[quota.tier] = {
          institutions: 0,
          totalQuota: 0,
          usedQuota: 0,
          participants: 0
        };
      }
      acc[quota.tier].institutions += 1;
      acc[quota.tier].totalQuota += quota.totalQuota;
      acc[quota.tier].usedQuota += quota.usedQuota;
      acc[quota.tier].participants += (quota.participants || []).length;
      return acc;
    }, {} as Record<string, any>);

    // Skill area distribution
    const skillAreaDistribution: Record<string, number> = {};
    (quotas as any[]).forEach(quota => {
      (quota.skillAreas || []).forEach((skill: string) => {
        skillAreaDistribution[skill] = (skillAreaDistribution[skill] || 0) + 1;
      });
    });

    return {
      reportGeneratedAt: new Date().toISOString(),
      period: {
        startDate: filters?.startDate || null,
        endDate: filters?.endDate || null
      },
      summary: {
        totalInstitutions,
        totalParticipants,
        totalInvitations,
        acceptedInvitations,
        invitationAcceptanceRate: Math.round(invitationAcceptanceRate * 100) / 100,
        overallQuotaUtilization: quotas.length > 0
          ? (quotas as any[]).reduce((sum, q) => sum + (q.totalQuota > 0 ? (q.usedQuota / q.totalQuota) * 100 : 0), 0) / quotas.length
          : 0
      },
      genderEquality: {
        metrics: genderMetrics,
        balanceScore: this.calculateGenderBalanceScore(genderMetrics)
      },
      tierEngagement,
      skillAreaDistribution,
      institutionBreakdown: quotas.map((q: any) => ({
        institution: q.institution?.name || 'Unknown',
        type: q.institution?.type || 'Unknown',
        tier: q.tier,
        quotaUtilization: q.totalQuota > 0 ? (q.usedQuota / q.totalQuota) * 100 : 0,
        participantCount: (q.participants || []).length,
        genderDistribution: {
          male: q.genderQuota?.maleUsed || 0,
          female: q.genderQuota?.femaleUsed || 0,
          other: q.genderQuota?.otherUsed || 0
        }
      })),
      invitationAnalysis: {
        total: totalInvitations,
        byStatus: {
          pending: invitations.filter(i => i.status === 'PENDING').length,
          accepted: acceptedInvitations,
          declined: invitations.filter(i => i.status === 'DECLINED').length,
          expired: invitations.filter(i => i.status === 'EXPIRED').length
        },
        byTier: this.groupInvitationsByTier(invitations)
      }
    };
  }

  /**
   * Calculate gender balance score (0-100, higher is better)
   */
  private calculateGenderBalanceScore(metrics: any): number {
    const total = metrics.male.total + metrics.female.total + metrics.other.total;
    if (total === 0) return 100; // Perfect balance if no quotas set

    const maleRatio = metrics.male.total / total;
    const femaleRatio = metrics.female.total / total;
    const idealRatio = 0.5; // 50-50 ideal

    // Calculate deviation from ideal (lower deviation = higher score)
    const deviation = Math.abs(maleRatio - idealRatio) + Math.abs(femaleRatio - idealRatio);
    return Math.max(0, 100 - (deviation * 200)); // Scale to 0-100
  }

  /**
   * Group invitations by tier
   */
  private groupInvitationsByTier(invitations: any[]): Record<string, any> {
    return invitations.reduce((acc, inv) => {
      const invitingTier = this.determineTier(inv.institution.type);
      const invitedTier = this.determineTier(inv.invitedInstitution.type);
      
      const key = `${invitingTier}_to_${invitedTier}`;
      if (!acc[key]) {
        acc[key] = {
          count: 0,
          accepted: 0,
          declined: 0
        };
      }
      acc[key].count += 1;
      if (inv.status === 'ACCEPTED') acc[key].accepted += 1;
      if (inv.status === 'DECLINED') acc[key].declined += 1;
      
      return acc;
    }, {} as Record<string, any>);
  }
}

