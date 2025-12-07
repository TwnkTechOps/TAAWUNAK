import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';

@Injectable()
export class ProgressTrackingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get student progress dashboard
   */
  async getStudentProgress(studentId: string) {
    const [projects, submissions, milestones, badges] = await Promise.all([
      this.prisma.studentProject.findMany({
        where: { studentId },
        include: {
          milestones: true,
          submissions: true,
          _count: {
            select: { badges: true }
          }
        }
      }),
      this.prisma.studentSubmission.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.studentMilestone.findMany({
        where: {
          project: { studentId }
        },
        orderBy: { dueDate: 'asc' }
      }),
      this.prisma.studentBadge.findMany({
        where: { studentId },
        orderBy: { earnedAt: 'desc' }
      })
    ]);

    // Calculate learning outcomes
    const learningOutcomes = {
      projectsCompleted: projects.filter(p => p.status === 'COMPLETED').length,
      projectsInProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
      milestonesCompleted: milestones.filter(m => m.status === 'DONE').length,
      totalSubmissions: submissions.length,
      averageScore: this.calculateAverageScore(submissions),
      skillsDeveloped: this.extractSkills(projects),
      researchAreas: this.extractResearchAreas(projects)
    };

    return {
      projects,
      submissions,
      milestones,
      badges,
      learningOutcomes,
      progressTimeline: this.buildProgressTimeline(projects, submissions, badges)
    };
  }

  /**
   * Get school-level progress statistics
   */
  async getSchoolProgress(schoolId: string) {
    const [projects, students, clubs, competitions] = await Promise.all([
      this.prisma.studentProject.findMany({
        where: { schoolId },
        include: {
          student: {
            select: { id: true, fullName: true }
          },
          _count: {
            select: { badges: true }
          }
        }
      }),
      this.prisma.user.findMany({
        where: {
          institutionId: schoolId,
          role: 'STUDENT'
        },
        include: {
          studentProjects: true,
          studentBadges: true
        }
      }),
      this.prisma.innovationClub.findMany({
        where: { schoolId },
        include: {
          _count: {
            select: { members: true, projects: true }
          }
        }
      }),
      this.prisma.competitionRegistration.findMany({
        where: {
          project: { schoolId }
        },
        include: {
          competition: {
            select: { id: true, title: true }
          }
        }
      })
    ]);

    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'IN_PROGRESS').length,
      completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
      totalStudents: students.length,
      activeStudents: students.filter(s => s.studentProjects.some(p => p.status === 'IN_PROGRESS')).length,
      totalClubs: clubs.length,
      activeClubs: clubs.filter(c => c.status === 'ACTIVE').length,
      competitionParticipations: competitions.length,
      totalBadges: students.reduce((sum, s) => sum + s.studentBadges.length, 0)
    };

    return {
      stats,
      projects: projects.slice(0, 10),
      students: students.slice(0, 10),
      clubs,
      competitions: competitions.slice(0, 10)
    };
  }

  /**
   * Calculate average score from submissions
   */
  private calculateAverageScore(submissions: any[]): number {
    const scoredSubmissions = submissions.filter(s => s.score !== null);
    if (scoredSubmissions.length === 0) return 0;
    const sum = scoredSubmissions.reduce((acc, s) => acc + (s.score || 0), 0);
    return Math.round(sum / scoredSubmissions.length);
  }

  /**
   * Extract skills from projects
   */
  private extractSkills(projects: any[]): string[] {
    const skills = new Set<string>();
    projects.forEach(project => {
      if (project.category) skills.add(project.category);
      project.nationalPriorityTags?.forEach((tag: string) => skills.add(tag));
    });
    return Array.from(skills);
  }

  /**
   * Extract research areas
   */
  private extractResearchAreas(projects: any[]): string[] {
    const areas = new Set<string>();
    projects.forEach(project => {
      if (project.category) areas.add(project.category);
    });
    return Array.from(areas);
  }

  /**
   * Build progress timeline
   */
  private buildProgressTimeline(projects: any[], submissions: any[], badges: any[]) {
    const timeline: any[] = [];

    projects.forEach(project => {
      timeline.push({
        type: 'project_created',
        date: project.createdAt,
        title: `Started: ${project.title}`
      });
    });

    submissions.forEach(submission => {
      timeline.push({
        type: 'submission',
        date: submission.createdAt,
        title: 'Submitted work',
        projectId: submission.projectId
      });
    });

    badges.forEach(badge => {
      timeline.push({
        type: 'badge',
        date: badge.earnedAt,
        title: `Earned: ${badge.title}`,
        icon: badge.icon
      });
    });

    return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

