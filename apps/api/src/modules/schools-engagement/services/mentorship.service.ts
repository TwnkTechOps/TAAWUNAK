import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { Role, InstitutionType } from '@prisma/client';

@Injectable()
export class SchoolMentorshipService {
  constructor(private prisma: PrismaService) {}

  /**
   * Match school with mentor
   */
  async matchMentor(schoolId: string, data?: {
    studentId?: string;
    projectId?: string;
    preferredMentorId?: string;
  }) {
    const school = await this.prisma.institution.findUnique({
      where: { id: schoolId }
    });

    if (!school || school.type !== InstitutionType.SCHOOL) {
      throw new NotFoundException('School not found');
    }

    // Find available mentors (from universities or industry)
    const mentors = await this.prisma.user.findMany({
      where: {
        OR: [
          { role: Role.RESEARCHER },
          { role: Role.INSTITUTION_ADMIN },
          { institution: { type: { in: [InstitutionType.UNIVERSITY, InstitutionType.COMPANY] } } }
        ],
        institution: {
          verified: true
        }
      },
      include: {
        institution: {
          select: { id: true, name: true, type: true }
        }
      },
      take: 10
    });

    // If specific mentor requested
    if (data?.preferredMentorId) {
      const mentor = mentors.find(m => m.id === data.preferredMentorId);
      if (mentor) {
        return this.createMentorship(schoolId, mentor.id, data);
      }
    }

    // Auto-match based on availability
    const availableMentor = mentors[0];
    if (!availableMentor) {
      throw new NotFoundException('No available mentors found');
    }

    return this.createMentorship(schoolId, availableMentor.id, data);
  }

  /**
   * Create mentorship relationship
   */
  private async createMentorship(
    schoolId: string,
    mentorId: string,
    data?: {
      studentId?: string;
      projectId?: string;
    }
  ) {
    // Check if mentorship already exists
    const existing = await this.prisma.schoolMentorship.findFirst({
      where: {
        schoolId,
        mentorId,
        studentId: data?.studentId || null,
        projectId: data?.projectId || null,
        status: { in: ['PENDING', 'ACTIVE'] }
      }
    });

    if (existing) {
      return existing;
    }

    return this.prisma.schoolMentorship.create({
      data: {
        schoolId,
        mentorId,
        studentId: data?.studentId,
        projectId: data?.projectId,
        status: 'ACTIVE'
      },
      include: {
        mentor: {
          select: { id: true, fullName: true, email: true }
        },
        school: {
          select: { id: true, name: true }
        },
        student: {
          select: { id: true, fullName: true }
        },
        project: {
          select: { id: true, title: true }
        }
      }
    });
  }

  /**
   * Get mentorships for a school
   */
  async getSchoolMentorships(schoolId: string) {
    return this.prisma.schoolMentorship.findMany({
      where: { schoolId },
      include: {
        mentor: {
          include: {
            institution: {
              select: { id: true, name: true, type: true }
            }
          }
        },
        student: {
          select: { id: true, fullName: true }
        },
        project: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get mentorships for a mentor
   */
  async getMentorMentorships(mentorId: string) {
    return this.prisma.schoolMentorship.findMany({
      where: { mentorId },
      include: {
        school: {
          select: { id: true, name: true }
        },
        student: {
          select: { id: true, fullName: true }
        },
        project: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Complete mentorship
   */
  async completeMentorship(mentorshipId: string, notes?: string) {
    return this.prisma.schoolMentorship.update({
      where: { id: mentorshipId },
      data: {
        status: 'COMPLETED',
        endDate: new Date(),
        notes
      }
    });
  }
}

