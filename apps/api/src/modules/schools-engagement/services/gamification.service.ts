import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { BadgeType } from '@prisma/client';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Award badge to student
   */
  async awardBadge(studentId: string, data: {
    badgeType: BadgeType;
    projectId?: string;
    title?: string;
    description?: string;
    points?: number;
  }) {
    // Check if badge already awarded for this project
    if (data.projectId) {
      const existing = await this.prisma.studentBadge.findFirst({
        where: {
          studentId,
          projectId: data.projectId,
          badgeType: data.badgeType
        }
      });

      if (existing) {
        return existing; // Already awarded
      }
    }

    const badgeConfig = this.getBadgeConfig(data.badgeType);

    return this.prisma.studentBadge.create({
      data: {
        studentId,
        projectId: data.projectId,
        badgeType: data.badgeType,
        title: data.title || badgeConfig.title,
        description: data.description || badgeConfig.description,
        icon: badgeConfig.icon,
        points: data.points || badgeConfig.points
      }
    });
  }

  /**
   * Get badge configuration
   */
  private getBadgeConfig(badgeType: BadgeType) {
    const configs: Record<BadgeType, { title: string; description: string; icon: string; points: number }> = {
      FIRST_PROJECT: {
        title: 'First Steps',
        description: 'Completed your first research project',
        icon: '🎯',
        points: 50
      },
      RESEARCHER: {
        title: 'Researcher',
        description: 'Completed 3 research projects',
        icon: '🔬',
        points: 100
      },
      INNOVATOR: {
        title: 'Innovator',
        description: 'Created an innovative solution',
        icon: '💡',
        points: 150
      },
      COLLABORATOR: {
        title: 'Collaborator',
        description: 'Worked on a team project',
        icon: '👥',
        points: 75
      },
      MENTOR: {
        title: 'Mentor',
        description: 'Helped another student',
        icon: '🤝',
        points: 200
      },
      COMPETITION_WINNER: {
        title: 'Champion',
        description: 'Won a competition',
        icon: '🏆',
        points: 300
      },
      MILESTONE_ACHIEVER: {
        title: 'Milestone Master',
        description: 'Completed all project milestones',
        icon: '⭐',
        points: 100
      },
      CONSISTENT_LEARNER: {
        title: 'Dedicated Learner',
        description: 'Active for 30 consecutive days',
        icon: '📚',
        points: 150
      }
    };

    return configs[badgeType] || {
      title: 'Achievement',
      description: 'Great work!',
      icon: '🎖️',
      points: 50
    };
  }

  /**
   * Check and award badges based on student progress
   */
  async checkAndAwardBadges(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProjects: {
          include: {
            badges: true,
            milestones: true
          }
        },
        studentBadges: true
      }
    });

    if (!student) return [];

    const awardedBadges = [];

    // First project badge
    const completedProjects = student.studentProjects.filter(p => p.status === 'COMPLETED');
    if (completedProjects.length === 1) {
      const hasFirstBadge = (student.studentBadges || []).some((b: any) => b.badgeType === BadgeType.FIRST_PROJECT);
      if (!hasFirstBadge) {
        const badge = await this.awardBadge(studentId, {
          badgeType: BadgeType.FIRST_PROJECT,
          projectId: completedProjects[0].id
        });
        awardedBadges.push(badge);
      }
    }

    // Researcher badge (3 projects)
    if (completedProjects.length >= 3) {
      const hasResearcherBadge = (student.studentBadges || []).some((b: any) => b.badgeType === BadgeType.RESEARCHER);
      if (!hasResearcherBadge) {
        const badge = await this.awardBadge(studentId, {
          badgeType: BadgeType.RESEARCHER
        });
        awardedBadges.push(badge);
      }
    }

    // Milestone achiever
    for (const project of (student.studentProjects || [])) {
      if ((project.milestones || []).length > 0) {
        const allCompleted = (project.milestones || []).every((m: any) => m.status === 'DONE');
        if (allCompleted) {
          const hasBadge = (student.studentBadges || []).some(
            (b: any) => b.badgeType === BadgeType.MILESTONE_ACHIEVER && b.projectId === project.id
          );
          if (!hasBadge) {
            const badge = await this.awardBadge(studentId, {
              badgeType: BadgeType.MILESTONE_ACHIEVER,
              projectId: project.id
            });
            awardedBadges.push(badge);
          }
        }
      }
    }

    return awardedBadges;
  }

  /**
   * Get student leaderboard
   */
  async getLeaderboard(schoolId?: string, limit = 50) {
    const where = schoolId ? {
      institutionId: schoolId,
      role: 'STUDENT' as const
    } : {
      role: 'STUDENT' as const
    };

    const students = await this.prisma.user.findMany({
      where,
      include: {
        studentBadges: true,
        studentProjects: {
          where: { status: 'COMPLETED' }
        }
      }
    });

    // Calculate scores
    const leaderboard = students.map((student: any) => ({
      student: {
        id: student.id,
        fullName: student.fullName,
        email: student.email
      },
      totalPoints: (student.studentBadges || []).reduce((sum: number, b: any) => sum + (b.points || 0), 0),
      totalBadges: (student.studentBadges || []).length,
      completedProjects: (student.studentProjects || []).length
    })).sort((a, b) => b.totalPoints - a.totalPoints).slice(0, limit);

    return leaderboard;
  }

  /**
   * Get student's gamification stats
   */
  async getStudentStats(studentId: string) {
    const [badges, projects] = await Promise.all([
      this.prisma.studentBadge.findMany({
        where: { studentId },
        orderBy: { earnedAt: 'desc' }
      }),
      this.prisma.studentProject.findMany({
        where: { studentId },
        include: {
          _count: {
            select: { badges: true, milestones: true }
          }
        }
      })
    ]);

    const totalPoints = badges.reduce((sum, b) => sum + b.points, 0);
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
    const badgesByType = badges.reduce((acc, b) => {
      acc[b.badgeType] = (acc[b.badgeType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPoints,
      totalBadges: badges.length,
      completedProjects,
      badgesByType,
      recentBadges: badges.slice(0, 5),
      rank: await this.getStudentRank(studentId, totalPoints)
    };
  }

  /**
   * Get student rank
   */
  private async getStudentRank(studentId: string, points: number): Promise<number> {
    const studentsWithMorePoints = await this.prisma.user.count({
      where: {
        role: 'STUDENT',
        studentBadges: {
          some: {}
        }
      }
    });

    // Simplified rank calculation
    const allStudents = await this.prisma.user.count({
      where: { role: 'STUDENT' }
    });

    return allStudents > 0 ? Math.floor((studentsWithMorePoints / allStudents) * 100) : 0;
  }
}

