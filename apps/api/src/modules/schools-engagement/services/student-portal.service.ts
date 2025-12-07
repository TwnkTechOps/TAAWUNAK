import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { Role, InstitutionType } from '@prisma/client';

@Injectable()
export class StudentPortalService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get available challenges and mini-projects for students
   */
  async getAvailableChallenges(studentId: string, filters?: {
    difficulty?: string;
    category?: string;
    schoolId?: string;
  }) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { institution: true }
    });

    if (!student || student.role !== Role.STUDENT) {
      throw new ForbiddenException('Access restricted to students');
    }

    // Get templates and active competitions
    const [templates, competitions] = await Promise.all([
      this.prisma.studentProjectTemplate.findMany({
        where: {
          isPublic: true,
          ...(filters?.difficulty && { difficulty: filters.difficulty as any }),
          ...(filters?.category && { category: filters.category })
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.competition.findMany({
        where: {
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
          ...(filters?.category && { categories: { has: filters.category } })
        },
        include: {
          _count: {
            select: { registrations: true }
          }
        },
        orderBy: { startDate: 'asc' }
      })
    ]);

    return {
      templates,
      competitions,
      studentLevel: this.determineStudentLevel(student)
    };
  }

  /**
   * Get student's projects and progress
   */
  async getStudentDashboard(studentId: string) {
    const [projects, badges, certificates, clubMemberships] = await Promise.all([
      this.prisma.studentProject.findMany({
        where: { studentId },
        include: {
          teacher: {
            select: { id: true, fullName: true, email: true }
          },
          mentor: {
            select: { id: true, fullName: true, email: true }
          },
          club: {
            select: { id: true, name: true }
          },
          milestones: true,
          submissions: true,
          _count: {
            select: { badges: true, milestones: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.studentBadge.findMany({
        where: { studentId },
        include: { project: { select: { title: true } } },
        orderBy: { earnedAt: 'desc' },
        take: 10
      }),
      this.prisma.certificate.findMany({
        where: { recipientId: studentId },
        orderBy: { issuedAt: 'desc' },
        take: 10
      }),
      this.prisma.clubMember.findMany({
        where: { studentId, leftAt: null },
        include: {
          club: {
            include: {
              school: { select: { name: true } }
            }
          }
        }
      })
    ]);

    // Calculate statistics
    const stats = {
      totalProjects: projects.length,
      completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
      inProgressProjects: projects.filter(p => p.status === 'IN_PROGRESS').length,
      totalBadges: badges.length,
      totalPoints: badges.reduce((sum, b) => sum + b.points, 0),
      totalCertificates: certificates.length,
      activeClubs: clubMemberships.length
    };

    return {
      projects,
      badges,
      certificates,
      clubMemberships,
      stats
    };
  }

  /**
   * Get AI-suggested projects for student
   */
  async getAISuggestions(studentId: string, limit = 5) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        institution: true,
        studentProjects: {
          include: { badges: true }
        }
      }
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Determine student level based on past projects
    const studentLevel = this.determineStudentLevel(student);
    
    // Get appropriate templates
    const templates = await this.prisma.studentProjectTemplate.findMany({
      where: {
        isPublic: true,
        difficulty: studentLevel === 'beginner' ? 'BEGINNER' : 
                   studentLevel === 'intermediate' ? 'INTERMEDIATE' : 'ADVANCED'
      },
      take: limit
    });

    // Add AI recommendation score
    return templates.map(template => ({
      ...template,
      recommendationScore: this.calculateRecommendationScore(template, student),
      reason: this.getRecommendationReason(template, student)
    }));
  }

  /**
   * Determine student level based on experience
   */
  private determineStudentLevel(student: any): 'beginner' | 'intermediate' | 'advanced' {
    const completedProjects = student.studentProjects?.filter(
      (p: any) => p.status === 'COMPLETED'
    ).length || 0;

    if (completedProjects === 0) return 'beginner';
    if (completedProjects < 3) return 'intermediate';
    return 'advanced';
  }

  /**
   * Calculate recommendation score for a template
   */
  private calculateRecommendationScore(template: any, student: any): number {
    let score = 50; // Base score

    // Match difficulty with student level
    const studentLevel = this.determineStudentLevel(student);
    if (template.difficulty === 'BEGINNER' && studentLevel === 'beginner') score += 30;
    if (template.difficulty === 'INTERMEDIATE' && studentLevel === 'intermediate') score += 30;
    if (template.difficulty === 'ADVANCED' && studentLevel === 'advanced') score += 30;

    // Avoid duplicates (projects student hasn't done)
    const hasDoneSimilar = student.studentProjects?.some(
      (p: any) => p.category === template.category
    );
    if (!hasDoneSimilar) score += 20;

    return Math.min(100, score);
  }

  /**
   * Get recommendation reason
   */
  private getRecommendationReason(template: any, student: any): string {
    const studentLevel = this.determineStudentLevel(student);
    const reasons = [];

    if (template.difficulty === 'BEGINNER' && studentLevel === 'beginner') {
      reasons.push('Perfect for beginners');
    }
    if (template.category && !student.studentProjects?.some((p: any) => p.category === template.category)) {
      reasons.push('New research area to explore');
    }
    if (template.nationalPriorityTags && template.nationalPriorityTags.length > 0) {
      reasons.push('Aligned with national priorities');
    }

    return reasons.join(', ') || 'Recommended based on your profile';
  }

  /**
   * Create a new student project
   */
  async createStudentProject(studentId: string, data: {
    title: string;
    description: string;
    templateId?: string;
    teacherId?: string;
    clubId?: string;
    difficulty?: string;
    category?: string;
    nationalPriorityTags?: string[];
  }) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { institution: true }
    });

    if (!student || !student.institutionId) {
      throw new NotFoundException('Student or institution not found');
    }

    // Verify school type
    if (student.institution?.type !== InstitutionType.SCHOOL) {
      throw new ForbiddenException('Only students from schools can create student projects');
    }

    return this.prisma.studentProject.create({
      data: {
        title: data.title,
        description: data.description,
        studentId,
        schoolId: student.institutionId,
        teacherId: data.teacherId,
        clubId: data.clubId,
        templateId: data.templateId,
        difficulty: (data.difficulty as any) || 'BEGINNER',
        category: data.category,
        nationalPriorityTags: data.nationalPriorityTags || [],
        aiSuggested: !!data.templateId
      },
      include: {
        teacher: true,
        club: true,
        template: true
      }
    });
  }

  /**
   * Submit project milestone or final submission
   */
  async submitProjectWork(projectId: string, studentId: string, data: {
    content: string;
    fileUrl?: string;
    s3Key?: string;
  }) {
    const project = await this.prisma.studentProject.findUnique({
      where: { id: projectId }
    });

    if (!project || project.studentId !== studentId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.studentSubmission.create({
      data: {
        projectId,
        studentId,
        content: data.content,
        fileUrl: data.fileUrl,
        s3Key: data.s3Key,
        status: 'SUBMITTED'
      }
    });
  }
}

