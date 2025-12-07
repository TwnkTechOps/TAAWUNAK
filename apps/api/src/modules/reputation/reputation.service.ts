import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../services/prisma.service';

export interface ReputationScore {
  score: number;
  breakdown: {
    projects: number;
    papers: number;
    proposals: number;
    reviews: number;
    patents: number;
    collaborations: number;
    funding: number;
    credentials: number;
  };
  percentile: number;
  trend: 'up' | 'down' | 'stable';
}

@Injectable()
export class ReputationService {
  constructor(private prisma: PrismaService) {}

  async calculateUserReputation(userId: string): Promise<ReputationScore> {
    const [
      projects,
      papers,
      proposals,
      reviews,
      credentials,
      memberships
    ] = await Promise.all([
      this.prisma.project.count({where: {ownerId: userId}}),
      this.prisma.paper.count({where: {createdById: userId}}),
      this.prisma.proposal.count({where: {project: {ownerId: userId}}}),
      this.prisma.review.count({where: {reviewerId: userId}}),
      this.prisma.credential.count({where: {userId, status: 'VERIFIED'}}),
      this.prisma.membership.count({where: {userId, status: 'ACTIVE'}})
    ]);

    // Calculate scores with weights
    const breakdown = {
      projects: projects * 3,
      papers: papers * 5,
      proposals: proposals * 2,
      reviews: reviews * 4,
      patents: 0, // Placeholder - would need Patent model
      collaborations: memberships * 2,
      funding: 0, // Placeholder - would need Funding model
      credentials: credentials * 1
    };

    const score = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    // Calculate percentile (simplified - would need all users for real percentile)
    const allUsers = await this.prisma.user.count();
    const usersWithHigherScore = await this.prisma.user.count({
      where: {
        // This is simplified - in production, would calculate all user scores
        id: {not: userId}
      }
    });
    const percentile = Math.round((1 - usersWithHigherScore / allUsers) * 100);

    // Trend calculation (simplified - would compare with historical data)
    const trend: 'up' | 'down' | 'stable' = 'stable';

    return {score, breakdown, percentile, trend};
  }

  async calculateInstitutionReputation(institutionId: string): Promise<ReputationScore> {
    const members = await this.prisma.membership.findMany({
      where: {institutionId, status: 'ACTIVE'},
      include: {user: true}
    });

    const userIds = members.map(m => m.userId);
    
    const [
      projects,
      papers,
      proposals,
      reviews,
      credentials
    ] = await Promise.all([
      this.prisma.project.count({where: {ownerId: {in: userIds}}}),
      this.prisma.paper.count({where: {createdById: {in: userIds}}}),
      this.prisma.proposal.count({where: {project: {ownerId: {in: userIds}}}}),
      this.prisma.review.count({where: {reviewerId: {in: userIds}}}),
      this.prisma.credential.count({where: {userId: {in: userIds}, status: 'VERIFIED'}})
    ]);

    const breakdown = {
      projects: projects * 3,
      papers: papers * 5,
      proposals: proposals * 2,
      reviews: reviews * 4,
      patents: 0,
      collaborations: members.length * 2,
      funding: 0,
      credentials: credentials * 1
    };

    const score = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    return {
      score,
      breakdown,
      percentile: 50, // Simplified
      trend: 'stable'
    };
  }
}
