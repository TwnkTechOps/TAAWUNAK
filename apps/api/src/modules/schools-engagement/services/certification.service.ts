import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { CertificateType } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class CertificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Issue a certificate
   */
  async issueCertificate(data: {
    recipientId: string;
    certificateType: CertificateType;
    title: string;
    description?: string;
    projectId?: string;
    competitionId?: string;
    clubId?: string;
    expiresAt?: Date;
  }) {
    // Generate unique verification code
    const verificationCode = this.generateVerificationCode();

    return this.prisma.certificate.create({
      data: {
        recipientId: data.recipientId,
        certificateType: data.certificateType,
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        competitionId: data.competitionId,
        clubId: data.clubId,
        verificationCode,
        expiresAt: data.expiresAt
      }
    });
  }

  /**
   * Auto-issue certificate for project completion
   */
  async issueProjectCompletionCertificate(projectId: string) {
    const project = await this.prisma.studentProject.findUnique({
      where: { id: projectId },
      include: { student: true, teacher: true }
    });

    if (!project || project.status !== 'COMPLETED') {
      return null;
    }

    // Issue certificate to student
    const studentCert = await this.issueCertificate({
      recipientId: project.studentId,
      certificateType: CertificateType.PROJECT_COMPLETION,
      title: `Project Completion: ${project.title}`,
      description: `Successfully completed research project: ${project.title}`,
      projectId: project.id
    });

    // Optionally issue certificate to teacher
    if (project.teacherId) {
      await this.issueCertificate({
        recipientId: project.teacherId,
        certificateType: CertificateType.TEACHER_FACILITATOR,
        title: `Facilitator Certificate: ${project.title}`,
        description: `Successfully facilitated student project: ${project.title}`,
        projectId: project.id
      });
    }

    return studentCert;
  }

  /**
   * Issue competition certificates
   */
  async issueCompetitionCertificates(competitionId: string, winners: string[]) {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId }
    });

    if (!competition) {
      throw new Error('Competition not found');
    }

    const registrations = await this.prisma.competitionRegistration.findMany({
      where: { competitionId },
      include: { project: true }
    });

    // Issue participation certificates to all
    for (const registration of registrations) {
      await this.issueCertificate({
        recipientId: registration.project.studentId,
        certificateType: CertificateType.COMPETITION_PARTICIPATION,
        title: `Participation: ${competition.title}`,
        description: `Participated in ${competition.title}`,
        competitionId
      });
    }

    // Issue winner certificates
    for (const projectId of winners) {
      const registration = registrations.find(r => r.projectId === projectId);
      if (registration) {
        await this.issueCertificate({
          recipientId: registration.project.studentId,
          certificateType: CertificateType.COMPETITION_WINNER,
          title: `Winner: ${competition.title}`,
          description: `Won ${competition.title}`,
          competitionId,
          projectId
        });
      }
    }
  }

  /**
   * Verify certificate
   */
  async verifyCertificate(verificationCode: string) {
    return this.prisma.certificate.findUnique({
      where: { verificationCode },
      include: {
        recipient: {
          select: { id: true, fullName: true, email: true }
        },
        project: {
          select: { id: true, title: true }
        },
        competition: {
          select: { id: true, title: true }
        },
        club: {
          select: { id: true, name: true }
        }
      }
    });
  }

  /**
   * Get certificates for a user
   */
  async getUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { recipientId: userId },
      include: {
        project: {
          select: { id: true, title: true }
        },
        competition: {
          select: { id: true, title: true }
        },
        club: {
          select: { id: true, name: true }
        }
      },
      orderBy: { issuedAt: 'desc' }
    });
  }

  /**
   * Generate verification code
   */
  private generateVerificationCode(): string {
    return `CERT-${randomBytes(8).toString('hex').toUpperCase()}`;
  }
}

