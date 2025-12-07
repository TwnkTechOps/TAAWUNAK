import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { Role, InstitutionType } from '@prisma/client';

@Injectable()
export class TeacherProjectsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a teacher-facilitated project assignment
   */
  async createTeacherProject(teacherId: string, data: {
    title: string;
    description: string;
    studentIds: string[];
    templateId?: string;
    dueDate?: Date;
    difficulty?: string;
    category?: string;
  }) {
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
      include: { institution: true }
    });

    if (!teacher || teacher.role !== Role.STUDENT && teacher.institution?.type !== InstitutionType.SCHOOL) {
      throw new ForbiddenException('Only teachers from schools can create assignments');
    }

    // Verify all students belong to same school
    const students = await this.prisma.user.findMany({
      where: {
        id: { in: data.studentIds },
        institutionId: teacher.institutionId
      }
    });

    if (students.length !== data.studentIds.length) {
      throw new ForbiddenException('All students must belong to your school');
    }

    // Create projects for each student
    const projects = await Promise.all(
      data.studentIds.map(studentId =>
        this.prisma.studentProject.create({
          data: {
            title: data.title,
            description: data.description,
            studentId,
            teacherId,
            schoolId: teacher.institutionId!,
            templateId: data.templateId,
            difficulty: (data.difficulty as any) || 'BEGINNER',
            category: data.category,
            status: 'IN_PROGRESS'
          }
        })
      )
    );

    // Create initial milestones if due date provided
    if (data.dueDate) {
      await Promise.all(
        projects.map(project =>
          this.prisma.studentMilestone.create({
            data: {
              projectId: project.id,
              title: 'Project Completion',
              description: 'Complete and submit your project',
              dueDate: data.dueDate,
              status: 'PENDING'
            }
          })
        )
      );
    }

    return projects;
  }

  /**
   * Get teacher's supervised projects
   */
  async getTeacherProjects(teacherId: string, filters?: {
    status?: string;
    studentId?: string;
  }) {
    return this.prisma.studentProject.findMany({
      where: {
        teacherId,
        ...(filters?.status && { status: filters.status as any }),
        ...(filters?.studentId && { studentId: filters.studentId })
      },
      include: {
        student: {
          select: { id: true, fullName: true, email: true }
        },
        milestones: true,
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: { submissions: true, milestones: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Provide feedback on student submission
   */
  async provideFeedback(
    submissionId: string,
    teacherId: string,
    data: {
      feedback: string;
      score?: number;
      status?: string;
    }
  ) {
    const submission = await this.prisma.studentSubmission.findUnique({
      where: { id: submissionId },
      include: { project: true }
    });

    if (!submission || submission.project.teacherId !== teacherId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.studentSubmission.update({
      where: { id: submissionId },
      data: {
        teacherFeedback: data.feedback,
        score: data.score,
        status: (data.status as any) || 'REVIEWED',
        teacherFeedbackAt: new Date()
      }
    });
  }

  /**
   * Get teacher dashboard statistics
   */
  async getTeacherDashboard(teacherId: string) {
    const [projects, students, submissions] = await Promise.all([
      this.prisma.studentProject.findMany({
        where: { teacherId },
        include: {
          _count: {
            select: { submissions: true, milestones: true }
          }
        }
      }),
      this.prisma.studentProject.findMany({
        where: { teacherId },
        select: { studentId: true },
        distinct: ['studentId']
      }),
      this.prisma.studentSubmission.findMany({
        where: {
          project: { teacherId },
          status: 'SUBMITTED'
        }
      })
    ]);

    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'IN_PROGRESS').length,
      completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
      totalStudents: students.length,
      pendingReviews: submissions.filter(s => s.status === 'SUBMITTED').length
    };

    return {
      stats,
      recentProjects: projects.slice(0, 10),
      pendingSubmissions: submissions.slice(0, 10)
    };
  }
}

