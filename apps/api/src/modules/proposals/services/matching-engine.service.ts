import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { InstitutionType } from '@prisma/client';

export interface MatchResult {
  proposalId: string;
  enterpriseId: string;
  matchScore: number;
  domainAlignment: number;
  capabilityMatch: number;
  reasons: string[];
}

@Injectable()
export class MatchingEngineService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find matching enterprises for a proposal
   */
  async findMatchesForProposal(proposalId: string, limit = 10): Promise<MatchResult[]> {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        project: {
          include: {
            institution: true
          }
        },
        evaluation: true
      }
    });

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    // Get all enterprise institutions (COMPANY type)
    const enterprises = await this.prisma.institution.findMany({
      where: {
        type: InstitutionType.COMPANY,
        verified: true
      },
      include: {
        projects: {
          select: {
            title: true,
            summary: true
          }
        }
      }
    });

    // Calculate matches
    const matches: MatchResult[] = [];

    for (const enterprise of enterprises) {
      const match = await this.calculateMatch(proposal, enterprise);
      if (match.matchScore > 50) { // Only include matches above threshold
        matches.push(match);
      }
    }

    // Sort by match score and return top matches
    matches.sort((a, b) => b.matchScore - a.matchScore);
    return matches.slice(0, limit);
  }

  /**
   * Calculate match between proposal and enterprise
   */
  private async calculateMatch(proposal: any, enterprise: any): Promise<MatchResult> {
    // Domain alignment: Match based on keywords, strategic alignment, and project domains
    const domainAlignment = this.calculateDomainAlignment(proposal, enterprise);

    // Capability match: Based on enterprise's past projects and expertise
    const capabilityMatch = this.calculateCapabilityMatch(proposal, enterprise);

    // Overall match score (weighted)
    const matchScore = domainAlignment * 0.6 + capabilityMatch * 0.4;

    // Generate reasons for the match
    const reasons = this.generateMatchReasons(proposal, enterprise, domainAlignment, capabilityMatch);

    return {
      proposalId: proposal.id,
      enterpriseId: enterprise.id,
      matchScore: Math.round(matchScore * 100) / 100,
      domainAlignment: Math.round(domainAlignment * 100) / 100,
      capabilityMatch: Math.round(capabilityMatch * 100) / 100,
      reasons
    };
  }

  /**
   * Calculate domain alignment score (0-100)
   */
  private calculateDomainAlignment(proposal: any, enterprise: any): number {
    let score = 50; // Base score

    // Check strategic alignment keywords
    if (proposal.strategicAlignment && proposal.strategicAlignment.length > 0) {
      // If proposal has strategic alignment tags, increase score
      score += Math.min(proposal.strategicAlignment.length * 5, 30);
    }

    // Check if enterprise name or projects contain relevant keywords
    const proposalContent = `${proposal.project?.title || ''} ${proposal.content || ''}`.toLowerCase();
    const enterpriseName = enterprise.name.toLowerCase();

    // Simple keyword matching (can be enhanced with NLP)
    const commonKeywords = this.extractKeywords(proposalContent);
    const enterpriseKeywords = this.extractKeywords(enterpriseName);

    const keywordOverlap = this.calculateKeywordOverlap(commonKeywords, enterpriseKeywords);
    score += keywordOverlap * 20;

    return Math.min(100, score);
  }

  /**
   * Calculate capability match score (0-100)
   */
  private calculateCapabilityMatch(proposal: any, enterprise: any): number {
    let score = 40; // Base score for any enterprise

    // If enterprise has projects, increase score
    if (enterprise.projects && enterprise.projects.length > 0) {
      score += Math.min(enterprise.projects.length * 5, 30);
    }

    // If enterprise is verified, increase score
    if (enterprise.verified) {
      score += 20;
    }

    // Check if enterprise has relevant project experience
    if (enterprise.projects && enterprise.projects.length > 0) {
      const proposalKeywords = this.extractKeywords(
        `${proposal.project?.title || ''} ${proposal.content || ''}`
      );
      
      let relevantProjects = 0;
      for (const project of enterprise.projects) {
        const projectKeywords = this.extractKeywords(
          `${project.title || ''} ${project.summary || ''}`
        );
        const overlap = this.calculateKeywordOverlap(proposalKeywords, projectKeywords);
        if (overlap > 0.3) {
          relevantProjects++;
        }
      }

      score += Math.min(relevantProjects * 10, 20);
    }

    return Math.min(100, score);
  }

  /**
   * Extract keywords from text (simple implementation)
   */
  private extractKeywords(text: string): string[] {
    // Remove common words and extract meaningful terms
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    return [...new Set(words)]; // Remove duplicates
  }

  /**
   * Calculate keyword overlap between two sets
   */
  private calculateKeywordOverlap(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 || keywords2.length === 0) {
      return 0;
    }

    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size; // Jaccard similarity
  }

  /**
   * Generate reasons for match
   */
  private generateMatchReasons(
    proposal: any,
    enterprise: any,
    domainAlignment: number,
    capabilityMatch: number
  ): string[] {
    const reasons: string[] = [];

    if (domainAlignment >= 70) {
      reasons.push('Strong domain alignment with enterprise focus areas');
    } else if (domainAlignment >= 50) {
      reasons.push('Moderate domain alignment');
    }

    if (capabilityMatch >= 70) {
      reasons.push('Enterprise has relevant project experience and capabilities');
    } else if (capabilityMatch >= 50) {
      reasons.push('Enterprise has some relevant capabilities');
    }

    if (enterprise.verified) {
      reasons.push('Verified enterprise with established track record');
    }

    if (proposal.tier === 'TIER_1') {
      reasons.push('High-tier proposal ready for partnership');
    }

    if (proposal.evaluation?.overallScore >= 80) {
      reasons.push('High-quality proposal with strong evaluation scores');
    }

    return reasons.length > 0 ? reasons : ['Potential match based on general criteria'];
  }

  /**
   * Save matches to database
   */
  async saveMatches(proposalId: string, matches: MatchResult[]): Promise<void> {
    for (const match of matches) {
      await this.prisma.proposalMatch.upsert({
        where: {
          proposalId_enterpriseId: {
            proposalId: match.proposalId,
            enterpriseId: match.enterpriseId
          }
        },
        create: {
          proposalId: match.proposalId,
          enterpriseId: match.enterpriseId,
          matchScore: match.matchScore,
          domainAlignment: match.domainAlignment,
          capabilityMatch: match.capabilityMatch,
          reasons: match.reasons
        },
        update: {
          matchScore: match.matchScore,
          domainAlignment: match.domainAlignment,
          capabilityMatch: match.capabilityMatch,
          reasons: match.reasons,
          suggestedAt: new Date()
        }
      });
    }
  }

  /**
   * Get matches for an enterprise
   */
  async getMatchesForEnterprise(enterpriseId: string, limit = 20) {
    return this.prisma.proposalMatch.findMany({
      where: {
        enterpriseId,
        proposal: {
          isPublic: true
        }
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
        matchScore: 'desc'
      },
      take: limit
    });
  }

  /**
   * Accept a match (enterprise expresses interest)
   */
  async acceptMatch(proposalId: string, enterpriseId: string): Promise<void> {
    await this.prisma.proposalMatch.update({
      where: {
        proposalId_enterpriseId: {
          proposalId,
          enterpriseId
        }
      },
      data: {
        isAccepted: true,
        acceptedAt: new Date()
      }
    });
  }
}

