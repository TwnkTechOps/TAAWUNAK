import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { ProposalTier } from '@prisma/client';

export interface TierClassificationResult {
  tier: ProposalTier;
  tierScore: number;
  reasons: string[];
  recommendations: string[];
}

@Injectable()
export class TierClassificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Classify proposal into tier based on evaluation scores
   */
  async classifyProposal(
    proposalId: string,
    overallScore: number,
    qualityScore: number,
    innovationScore: number,
    feasibilityScore: number,
    alignmentScore: number
  ): Promise<TierClassificationResult> {
    // Calculate weighted tier score
    const tierScore = this.calculateTierScore(
      overallScore,
      qualityScore,
      innovationScore,
      feasibilityScore,
      alignmentScore
    );

    // Determine tier based on score thresholds
    const tier = this.determineTier(tierScore);
    const reasons = this.getTierReasons(tier, tierScore, {
      overallScore,
      qualityScore,
      innovationScore,
      feasibilityScore,
      alignmentScore
    });
    const recommendations = this.getTierRecommendations(tier, {
      overallScore,
      qualityScore,
      innovationScore,
      feasibilityScore,
      alignmentScore
    });

    // Update proposal with tier classification
    await this.prisma.proposal.update({
      where: { id: proposalId },
      data: {
        tier,
        tierScore,
        overallScore,
        qualityScore,
        innovationScore,
        feasibilityScore
      }
    });

    return {
      tier,
      tierScore,
      reasons,
      recommendations
    };
  }

  /**
   * Calculate tier score (0-100) based on weighted factors
   */
  private calculateTierScore(
    overallScore: number,
    qualityScore: number,
    innovationScore: number,
    feasibilityScore: number,
    alignmentScore: number
  ): number {
    // Weighted calculation:
    // Overall: 30%, Quality: 20%, Innovation: 25%, Feasibility: 15%, Alignment: 10%
    const weightedScore =
      overallScore * 0.3 +
      qualityScore * 0.2 +
      innovationScore * 0.25 +
      feasibilityScore * 0.15 +
      alignmentScore * 0.1;

    return Math.round(weightedScore * 100) / 100;
  }

  /**
   * Determine tier based on tier score
   */
  private determineTier(tierScore: number): ProposalTier {
    if (tierScore >= 80) {
      return ProposalTier.TIER_1; // High impact, ready for partnership
    } else if (tierScore >= 65) {
      return ProposalTier.TIER_2; // Good potential, needs refinement
    } else if (tierScore >= 50) {
      return ProposalTier.TIER_3; // Early stage, requires development
    } else {
      return ProposalTier.TIER_4; // Not ready for partnership
    }
  }

  /**
   * Get reasons for tier classification
   */
  private getTierReasons(
    tier: ProposalTier,
    tierScore: number,
    scores: {
      overallScore: number;
      qualityScore: number;
      innovationScore: number;
      feasibilityScore: number;
      alignmentScore: number;
    }
  ): string[] {
    const reasons: string[] = [];

    switch (tier) {
      case ProposalTier.TIER_1:
        reasons.push(`Excellent tier score of ${tierScore.toFixed(1)}`);
        if (scores.overallScore >= 85) {
          reasons.push('High overall quality and completeness');
        }
        if (scores.innovationScore >= 80) {
          reasons.push('Strong innovation potential');
        }
        if (scores.feasibilityScore >= 75) {
          reasons.push('High feasibility and readiness');
        }
        if (scores.alignmentScore >= 80) {
          reasons.push('Strong alignment with national priorities');
        }
        reasons.push('Ready for immediate enterprise partnership');
        break;

      case ProposalTier.TIER_2:
        reasons.push(`Good tier score of ${tierScore.toFixed(1)}`);
        if (scores.qualityScore < 70) {
          reasons.push('Proposal quality needs improvement');
        }
        if (scores.innovationScore < 70) {
          reasons.push('Innovation potential could be enhanced');
        }
        if (scores.feasibilityScore < 65) {
          reasons.push('Feasibility concerns need addressing');
        }
        reasons.push('Refinement recommended before enterprise partnership');
        break;

      case ProposalTier.TIER_3:
        reasons.push(`Moderate tier score of ${tierScore.toFixed(1)}`);
        reasons.push('Early stage proposal requiring significant development');
        if (scores.overallScore < 60) {
          reasons.push('Overall proposal needs substantial improvement');
        }
        if (scores.feasibilityScore < 60) {
          reasons.push('Feasibility concerns require attention');
        }
        reasons.push('Not yet ready for enterprise partnership');
        break;

      case ProposalTier.TIER_4:
        reasons.push(`Low tier score of ${tierScore.toFixed(1)}`);
        reasons.push('Proposal requires major improvements across all dimensions');
        if (scores.qualityScore < 50) {
          reasons.push('Quality standards not met');
        }
        if (scores.innovationScore < 50) {
          reasons.push('Limited innovation potential');
        }
        if (scores.feasibilityScore < 50) {
          reasons.push('Significant feasibility challenges');
        }
        reasons.push('Not suitable for enterprise partnership at this stage');
        break;
    }

    return reasons;
  }

  /**
   * Get recommendations for improving tier
   */
  private getTierRecommendations(
    tier: ProposalTier,
    scores: {
      overallScore: number;
      qualityScore: number;
      innovationScore: number;
      feasibilityScore: number;
      alignmentScore: number;
    }
  ): string[] {
    const recommendations: string[] = [];

    if (scores.qualityScore < 70) {
      recommendations.push('Enhance proposal quality: Add detailed methodology, clear objectives, and comprehensive timeline');
    }

    if (scores.innovationScore < 70) {
      recommendations.push('Strengthen innovation: Highlight novel approaches, unique value proposition, and competitive advantages');
    }

    if (scores.feasibilityScore < 70) {
      recommendations.push('Improve feasibility: Provide detailed resource requirements, risk mitigation strategies, and realistic timelines');
    }

    if (scores.alignmentScore < 70) {
      recommendations.push('Align with national priorities: Connect proposal to Vision 2030 goals and strategic initiatives');
    }

    if (tier === ProposalTier.TIER_2) {
      recommendations.push('Consider peer review and expert feedback before resubmission');
      recommendations.push('Strengthen partnership value proposition for enterprises');
    }

    if (tier === ProposalTier.TIER_3 || tier === ProposalTier.TIER_4) {
      recommendations.push('Consider mentorship or collaboration with experienced researchers');
      recommendations.push('Develop proof-of-concept or pilot study before full proposal');
      recommendations.push('Seek institutional support and resources');
    }

    return recommendations;
  }

  /**
   * Get proposals by tier
   */
  async getProposalsByTier(tier: ProposalTier, limit = 50) {
    return this.prisma.proposal.findMany({
      where: {
        tier,
        isPublic: true // Only public proposals for enterprise browsing
      },
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
        evaluation: true,
        enterpriseInterests: {
          include: {
            institution: true
          }
        },
        matches: {
          include: {
            enterprise: true
          }
        },
        _count: {
          select: {
            enterpriseInterests: true,
            matches: true,
            feedbacks: true
          }
        }
      },
      orderBy: {
        tierScore: 'desc'
      },
      take: limit
    });
  }

  /**
   * Get tier statistics
   */
  async getTierStatistics() {
    const [tier1, tier2, tier3, tier4, total] = await Promise.all([
      this.prisma.proposal.count({ where: { tier: ProposalTier.TIER_1 } }),
      this.prisma.proposal.count({ where: { tier: ProposalTier.TIER_2 } }),
      this.prisma.proposal.count({ where: { tier: ProposalTier.TIER_3 } }),
      this.prisma.proposal.count({ where: { tier: ProposalTier.TIER_4 } }),
      this.prisma.proposal.count()
    ]);

    return {
      tier1,
      tier2,
      tier3,
      tier4,
      total,
      tier1Percentage: total > 0 ? ((tier1 / total) * 100).toFixed(1) : '0.0',
      tier2Percentage: total > 0 ? ((tier2 / total) * 100).toFixed(1) : '0.0',
      tier3Percentage: total > 0 ? ((tier3 / total) * 100).toFixed(1) : '0.0',
      tier4Percentage: total > 0 ? ((tier4 / total) * 100).toFixed(1) : '0.0'
    };
  }
}

