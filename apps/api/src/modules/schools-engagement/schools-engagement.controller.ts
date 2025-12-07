import { Body, Controller, Get, Post, Put, Param, Request, UseGuards, Query, Patch } from '@nestjs/common';
import { StudentPortalService } from './services/student-portal.service';
import { TeacherProjectsService } from './services/teacher-projects.service';
import { InnovationClubsService } from './services/innovation-clubs.service';
import { GamificationService } from './services/gamification.service';
import { CompetitionsService } from './services/competitions.service';
import { CertificationService } from './services/certification.service';
import { SchoolMentorshipService } from './services/mentorship.service';
import { ProgressTrackingService } from './services/progress-tracking.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('schools-engagement')
@UseGuards(JwtAuthGuard)
export class SchoolsEngagementController {
  constructor(
    private readonly studentPortal: StudentPortalService,
    private readonly teacherProjects: TeacherProjectsService,
    private readonly clubs: InnovationClubsService,
    private readonly gamification: GamificationService,
    private readonly competitions: CompetitionsService,
    private readonly certification: CertificationService,
    private readonly mentorship: SchoolMentorshipService,
    private readonly progress: ProgressTrackingService
  ) {}

  // ==================== Student Portal ====================

  @Get('student/dashboard')
  @Roles(Role.STUDENT)
  async getStudentDashboard(@Request() req: any) {
    return this.studentPortal.getStudentDashboard(req.user.id);
  }

  @Get('student/challenges')
  @Roles(Role.STUDENT)
  async getChallenges(@Request() req: any, @Query('difficulty') difficulty?: string, @Query('category') category?: string) {
    return this.studentPortal.getAvailableChallenges(req.user.id, { difficulty, category });
  }

  @Get('student/ai-suggestions')
  @Roles(Role.STUDENT)
  async getAISuggestions(@Request() req: any, @Query('limit') limit?: string) {
    return this.studentPortal.getAISuggestions(req.user.id, limit ? parseInt(limit) : 5);
  }

  @Post('student/projects')
  @Roles(Role.STUDENT)
  async createStudentProject(@Request() req: any, @Body() body: any) {
    return this.studentPortal.createStudentProject(req.user.id, body);
  }

  @Post('student/projects/:id/submit')
  @Roles(Role.STUDENT)
  async submitWork(@Param('id') projectId: string, @Request() req: any, @Body() body: any) {
    return this.studentPortal.submitProjectWork(projectId, req.user.id, body);
  }

  @Get('student/progress')
  @Roles(Role.STUDENT)
  async getStudentProgress(@Request() req: any) {
    return this.progress.getStudentProgress(req.user.id);
  }

  // ==================== Teacher Projects ====================

  @Get('teacher/dashboard')
  @Roles(Role.STUDENT) // Teachers might have STUDENT role in schools
  async getTeacherDashboard(@Request() req: any) {
    return this.teacherProjects.getTeacherDashboard(req.user.id);
  }

  @Get('teacher/projects')
  @Roles(Role.STUDENT)
  async getTeacherProjects(@Request() req: any, @Query('status') status?: string, @Query('studentId') studentId?: string) {
    return this.teacherProjects.getTeacherProjects(req.user.id, { status, studentId });
  }

  @Post('teacher/projects')
  @Roles(Role.STUDENT)
  async createTeacherProject(@Request() req: any, @Body() body: any) {
    return this.teacherProjects.createTeacherProject(req.user.id, body);
  }

  @Post('teacher/submissions/:id/feedback')
  @Roles(Role.STUDENT)
  async provideFeedback(@Param('id') submissionId: string, @Request() req: any, @Body() body: any) {
    return this.teacherProjects.provideFeedback(submissionId, req.user.id, body);
  }

  // ==================== Innovation Clubs ====================

  @Get('clubs')
  async getClubs(@Query('schoolId') schoolId?: string) {
    if (schoolId) {
      return this.clubs.getSchoolClubs(schoolId);
    }
    return [];
  }

  @Get('clubs/:id')
  async getClubDetails(@Param('id') id: string) {
    return this.clubs.getClubDetails(id);
  }

  @Post('clubs')
  @Roles(Role.STUDENT)
  async createClub(@Request() req: any, @Body() body: any) {
    return this.clubs.createClub(req.user.id, body);
  }

  @Post('clubs/:id/members')
  @Roles(Role.STUDENT)
  async addMember(@Param('id') clubId: string, @Body() body: { studentId: string; role?: string }) {
    return this.clubs.addMember(clubId, body.studentId, body.role);
  }

  @Post('clubs/:id/recognize')
  @Roles(Role.ADMIN, Role.INSTITUTION_ADMIN)
  async recognizeClub(@Param('id') clubId: string, @Body() body: { recognizedBy: string; level: string }) {
    return this.clubs.recognizeClub(clubId, body.recognizedBy, body.level);
  }

  // ==================== Gamification ====================

  @Get('student/badges')
  @Roles(Role.STUDENT)
  async getStudentBadges(@Request() req: any) {
    return this.gamification.getStudentStats(req.user.id);
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('schoolId') schoolId?: string, @Query('limit') limit?: string) {
    return this.gamification.getLeaderboard(schoolId, limit ? parseInt(limit) : 50);
  }

  @Post('student/check-badges')
  @Roles(Role.STUDENT)
  async checkBadges(@Request() req: any) {
    return this.gamification.checkAndAwardBadges(req.user.id);
  }

  // ==================== Competitions ====================

  @Get('competitions')
  async getCompetitions(@Query('type') type?: string, @Query('eligibility') eligibility?: string) {
    return this.competitions.getAvailableCompetitions({ type: type as any, eligibility: eligibility as any });
  }

  @Get('competitions/:id')
  async getCompetitionDetails(@Param('id') id: string) {
    return this.competitions.getCompetitionDetails(id);
  }

  @Post('competitions/:id/register')
  @Roles(Role.STUDENT)
  async registerForCompetition(@Param('id') competitionId: string, @Body() body: { projectId: string }) {
    return this.competitions.registerProject(competitionId, body.projectId);
  }

  @Get('showcase')
  async getShowcase(@Query('competitionId') competitionId?: string) {
    return this.competitions.getShowcaseProjects(competitionId);
  }

  @Post('competitions')
  @Roles(Role.ADMIN, Role.INSTITUTION_ADMIN)
  async createCompetition(@Body() body: any) {
    return this.competitions.createCompetition(body);
  }

  // ==================== Certificates ====================

  @Get('certificates')
  async getCertificates(@Request() req: any) {
    return this.certification.getUserCertificates(req.user.id);
  }

  @Get('certificates/verify/:code')
  async verifyCertificate(@Param('code') code: string) {
    return this.certification.verifyCertificate(code);
  }

  @Post('certificates/issue')
  @Roles(Role.ADMIN, Role.INSTITUTION_ADMIN)
  async issueCertificate(@Body() body: any) {
    return this.certification.issueCertificate(body);
  }

  // ==================== Mentorship ====================

  @Get('mentorships')
  async getMentorships(@Request() req: any, @Query('schoolId') schoolId?: string) {
    if (schoolId) {
      return this.mentorship.getSchoolMentorships(schoolId);
    }
    return this.mentorship.getMentorMentorships(req.user.id);
  }

  @Post('mentorships/match')
  @Roles(Role.ADMIN, Role.INSTITUTION_ADMIN)
  async matchMentor(@Body() body: { schoolId: string; studentId?: string; projectId?: string }) {
    return this.mentorship.matchMentor(body.schoolId, body);
  }

  @Patch('mentorships/:id/complete')
  @Roles(Role.ADMIN, Role.INSTITUTION_ADMIN)
  async completeMentorship(@Param('id') id: string, @Body() body: { notes?: string }) {
    return this.mentorship.completeMentorship(id, body.notes);
  }

  // ==================== Progress Tracking ====================

  @Get('school/:id/progress')
  @Roles(Role.ADMIN, Role.INSTITUTION_ADMIN)
  async getSchoolProgress(@Param('id') schoolId: string) {
    return this.progress.getSchoolProgress(schoolId);
  }
}

