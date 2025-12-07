import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { Role, InstitutionType } from '@prisma/client';

@Injectable()
export class InnovationClubsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create an innovation club
   */
  async createClub(advisorId: string, data: {
    name: string;
    description?: string;
    schoolId: string;
  }) {
    const advisor = await this.prisma.user.findUnique({
      where: { id: advisorId },
      include: { institution: true }
    });

    if (!advisor || advisor.institutionId !== data.schoolId) {
      throw new ForbiddenException('Advisor must belong to the specified school');
    }

    // Check if school is actually a school
    const school = await this.prisma.institution.findUnique({
      where: { id: data.schoolId }
    });

    if (school?.type !== InstitutionType.SCHOOL) {
      throw new ForbiddenException('Only schools can have innovation clubs');
    }

    return this.prisma.innovationClub.create({
      data: {
        name: data.name,
        description: data.description,
        schoolId: data.schoolId,
        advisorId,
        status: 'PENDING' // Requires platform recognition
      },
      include: {
        advisor: {
          select: { id: true, fullName: true, email: true }
        },
        school: {
          select: { id: true, name: true }
        }
      }
    });
  }

  /**
   * Recognize/approve a club
   */
  async recognizeClub(clubId: string, recognizedBy: string, recognitionLevel: string) {
    return this.prisma.innovationClub.update({
      where: { id: clubId },
      data: {
        status: 'ACTIVE',
        recognizedBy: recognitionLevel
      }
    });
  }

  /**
   * Add student to club
   */
  async addMember(clubId: string, studentId: string, role?: string) {
    const club = await this.prisma.innovationClub.findUnique({
      where: { id: clubId },
      include: { school: true }
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    const student = await this.prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student || student.institutionId !== club.schoolId) {
      throw new ForbiddenException('Student must belong to the same school');
    }

    return this.prisma.clubMember.upsert({
      where: {
        clubId_studentId: {
          clubId,
          studentId
        }
      },
      create: {
        clubId,
        studentId,
        role: (role as any) || 'MEMBER'
      },
      update: {
        role: (role as any) || 'MEMBER',
        leftAt: null // Rejoin if previously left
      }
    });
  }

  /**
   * Get club details with members and projects
   */
  async getClubDetails(clubId: string) {
    return this.prisma.innovationClub.findUnique({
      where: { id: clubId },
      include: {
        advisor: {
          select: { id: true, fullName: true, email: true }
        },
        school: {
          select: { id: true, name: true }
        },
        members: {
          include: {
            student: {
              select: { id: true, fullName: true, email: true }
            }
          },
          where: { leftAt: null }
        },
        projects: {
          include: {
            student: {
              select: { id: true, fullName: true }
            },
            _count: {
              select: { badges: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        achievements: {
          orderBy: { awardedAt: 'desc' },
          take: 10
        },
        _count: {
          select: { members: true, projects: true, achievements: true }
        }
      }
    });
  }

  /**
   * Get all clubs for a school
   */
  async getSchoolClubs(schoolId: string) {
    return this.prisma.innovationClub.findMany({
      where: { schoolId },
      include: {
        advisor: {
          select: { id: true, fullName: true }
        },
        _count: {
          select: { members: true, projects: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Record club achievement
   */
  async recordAchievement(clubId: string, data: {
    title: string;
    description?: string;
    type: string;
  }) {
    return this.prisma.clubAchievement.create({
      data: {
        clubId,
        title: data.title,
        description: data.description,
        type: data.type as any
      }
    });
  }
}

