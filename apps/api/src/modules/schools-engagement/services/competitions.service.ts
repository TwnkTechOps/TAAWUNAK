import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { CompetitionType, CompetitionEligibility, CompetitionRegistrationStatus } from '@prisma/client';

@Injectable()
export class CompetitionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a competition or showcase
   */
  async createCompetition(data: {
    title: string;
    description: string;
    type: CompetitionType;
    startDate: Date;
    endDate: Date;
    registrationDeadline: Date;
    isNational: boolean;
    eligibility: CompetitionEligibility;
    categories: string[];
    prizes?: any;
  }) {
    return this.prisma.competition.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        registrationDeadline: data.registrationDeadline,
        isNational: data.isNational,
        eligibility: data.eligibility,
        categories: data.categories,
        prizes: data.prizes
      }
    });
  }

  /**
   * Get available competitions for students
   */
  async getAvailableCompetitions(filters?: {
    type?: CompetitionType;
    eligibility?: CompetitionEligibility;
    category?: string;
  }) {
    const now = new Date();

    return this.prisma.competition.findMany({
      where: {
        registrationDeadline: { gte: now },
        endDate: { gte: now },
        ...(filters?.type && { type: filters.type }),
        ...(filters?.eligibility && { eligibility: filters.eligibility }),
        ...(filters?.category && { categories: { has: filters.category } })
      },
      include: {
        _count: {
          select: { registrations: true, judges: true }
        }
      },
      orderBy: { startDate: 'asc' }
    });
  }

  /**
   * Register project for competition
   */
  async registerProject(competitionId: string, projectId: string) {
    const [competition, project] = await Promise.all([
      this.prisma.competition.findUnique({ where: { id: competitionId } }),
      this.prisma.studentProject.findUnique({ where: { id: projectId } })
    ]);

    if (!competition || !project) {
      throw new NotFoundException('Competition or project not found');
    }

    // Check registration deadline
    if (new Date() > competition.registrationDeadline) {
      throw new ForbiddenException('Registration deadline has passed');
    }

    // Check eligibility
    if (!this.checkEligibility(competition.eligibility, project)) {
      throw new ForbiddenException('Project does not meet eligibility requirements');
    }

    return this.prisma.competitionRegistration.upsert({
      where: {
        competitionId_projectId: {
          competitionId,
          projectId
        }
      },
      create: {
        competitionId,
        projectId,
        status: CompetitionRegistrationStatus.REGISTERED
      },
      update: {
        status: CompetitionRegistrationStatus.REGISTERED
      }
    });
  }

  /**
   * Check project eligibility
   */
  private checkEligibility(eligibility: CompetitionEligibility, project: any): boolean {
    // Simplified eligibility check
    // In production, this would check school level, student grade, etc.
    return true;
  }

  /**
   * Get competition details with registrations
   */
  async getCompetitionDetails(competitionId: string) {
    return this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        registrations: {
          include: {
            project: {
              include: {
                student: {
                  select: { id: true, fullName: true }
                },
                school: {
                  select: { id: true, name: true }
                }
              }
            }
          },
          orderBy: { registeredAt: 'desc' }
        },
        judges: {
          include: {
            judge: {
              select: { id: true, fullName: true, email: true }
            }
          }
        },
        _count: {
          select: { registrations: true, judges: true }
        }
      }
    });
  }

  /**
   * Get showcase/exhibition projects
   */
  async getShowcaseProjects(competitionId?: string) {
    const where = competitionId
      ? { competitionId, status: 'APPROVED' as const }
      : { status: 'APPROVED' as const };

    return this.prisma.studentProject.findMany({
      where,
      include: {
        student: {
          select: { id: true, fullName: true }
        },
        school: {
          select: { id: true, name: true }
        },
        competition: {
          select: { id: true, title: true }
        },
        _count: {
          select: { badges: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }
}

