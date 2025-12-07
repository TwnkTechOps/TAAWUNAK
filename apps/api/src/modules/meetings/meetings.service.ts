import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MeetingsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService
  ) {}

  // ==================== Virtual Meetings ====================

  async createMeeting(
    createdById: string,
    title: string,
    description: string,
    startTime: Date,
    endTime: Date,
    meetingType: 'PLATFORM' | 'ZOOM' | 'TEAMS' | 'GOOGLE_MEET' = 'PLATFORM',
    projectId?: string
  ) {
    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Generate meeting URL based on type
    let meetingUrl: string | undefined;
    let externalMeetingId: string | undefined;

    if (meetingType === 'PLATFORM') {
      // Platform-native meeting - generate unique URL
      const meetingId = `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      meetingUrl = `${this.config.get('APP_URL', 'http://localhost:4320')}/meetings/${meetingId}`;
    } else {
      // For external meetings, URL would be set after integration
      // This is a placeholder - actual integration would call external APIs
      meetingUrl = `https://${meetingType.toLowerCase()}.com/meeting/placeholder`;
      externalMeetingId = `ext-${Date.now()}`;
    }

    const meeting = await this.prisma.virtualMeeting.create({
      data: {
        title,
        description,
        startTime,
        endTime,
        meetingType,
        meetingUrl,
        externalMeetingId,
        createdById,
        projectId
      },
      include: {
        createdBy: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        project: {
          select: { id: true, title: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, email: true, fullName: true, role: true }
            }
          }
        }
      }
    });

    // Add creator as participant
    await this.prisma.meetingParticipant.create({
      data: {
        meetingId: meeting.id,
        userId: createdById,
        status: 'ACTIVE'
      }
    });

    return meeting;
  }

  async getMeetings(userId: string, projectId?: string, upcoming?: boolean) {
    const where: any = {
      OR: [
        { createdById: userId },
        {
          participants: {
            some: {
              userId,
              leftAt: null
            }
          }
        }
      ]
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (upcoming) {
      where.startTime = { gte: new Date() };
    }

    const meetings = await this.prisma.virtualMeeting.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        project: {
          select: { id: true, title: true }
        },
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: { id: true, email: true, fullName: true, role: true }
            }
          }
        },
        _count: {
          select: { transcripts: true }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    return meetings;
  }

  async getMeeting(meetingId: string, userId: string) {
    const meeting = await this.prisma.virtualMeeting.findFirst({
      where: {
        id: meetingId,
        OR: [
          { createdById: userId },
          {
            participants: {
              some: {
                userId,
                leftAt: null
              }
            }
          }
        ]
      },
      include: {
        createdBy: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        project: {
          select: { id: true, title: true }
        },
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: { id: true, email: true, fullName: true, role: true }
            }
          }
        },
        transcripts: {
          where: {
            OR: [
              { isPublic: true },
              { accessLevel: 'PUBLIC' },
              {
                AND: [
                  { accessLevel: 'PARTICIPANTS' },
                  {
                    meeting: {
                      participants: {
                        some: { userId, leftAt: null }
                      }
                    }
                  }
                ]
              }
            ]
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found or access denied');
    }

    return meeting;
  }

  async addParticipant(meetingId: string, userId: string, addedById: string) {
    const meeting = await this.getMeeting(meetingId, addedById);

    // Check if user is already a participant
    const existing = await this.prisma.meetingParticipant.findUnique({
      where: {
        meetingId_userId: {
          meetingId,
          userId
        }
      }
    });

    if (existing && !existing.leftAt) {
      throw new BadRequestException('User is already a participant');
    }

    if (existing && existing.leftAt) {
      // Re-add participant
      return this.prisma.meetingParticipant.update({
        where: { id: existing.id },
        data: {
          userId,
          status: 'ACTIVE',
          leftAt: null
        },
        include: {
          user: {
            select: { id: true, email: true, fullName: true, role: true }
          }
        }
      });
    }

    return this.prisma.meetingParticipant.create({
      data: {
        meetingId,
        userId,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        }
      }
    });
  }

  async removeParticipant(meetingId: string, userId: string, removedById: string) {
    const meeting = await this.getMeeting(meetingId, removedById);

    // Only creator can remove others, or user can remove themselves
    if (meeting.createdById !== removedById && userId !== removedById) {
      throw new ForbiddenException('Only meeting creator can remove participants');
    }

    const participant = await this.prisma.meetingParticipant.findUnique({
      where: {
        meetingId_userId: {
          meetingId,
          userId
        }
      }
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    return this.prisma.meetingParticipant.update({
      where: { id: participant.id },
      data: {
        leftAt: new Date()
      }
    });
  }

  async startRecording(meetingId: string, userId: string) {
    const meeting = await this.getMeeting(meetingId, userId);

    if (meeting.createdById !== userId) {
      throw new ForbiddenException('Only meeting creator can start recording');
    }

    return this.prisma.virtualMeeting.update({
      where: { id: meetingId },
      data: { isRecorded: true }
    });
  }

  async stopRecording(meetingId: string, userId: string, recordingUrl: string) {
    const meeting = await this.getMeeting(meetingId, userId);

    if (meeting.createdById !== userId) {
      throw new ForbiddenException('Only meeting creator can stop recording');
    }

    return this.prisma.virtualMeeting.update({
      where: { id: meetingId },
      data: {
        isRecorded: false,
        recordingUrl
      }
    });
  }

  // ==================== Meeting Transcripts ====================

  async createTranscript(
    meetingId: string,
    content: string,
    summary: string,
    language: string = 'en',
    isPublic: boolean = false,
    accessLevel: 'CREATOR_ONLY' | 'PARTICIPANTS' | 'PROJECT_MEMBERS' | 'INSTITUTION' | 'PUBLIC' = 'PARTICIPANTS',
    createdById: string
  ) {
    const meeting = await this.getMeeting(meetingId, createdById);

    // Only creator or platform can create transcripts
    if (meeting.createdById !== createdById) {
      throw new ForbiddenException('Only meeting creator can create transcripts');
    }

    const transcript = await this.prisma.meetingTranscript.create({
      data: {
        meetingId,
        content,
        summary,
        language,
        isPublic,
        accessLevel
      }
    });

    return transcript;
  }

  async getTranscripts(meetingId: string, userId: string) {
    const meeting = await this.getMeeting(meetingId, userId);

    // Filter transcripts based on access level
    const transcripts = await this.prisma.meetingTranscript.findMany({
      where: {
        meetingId,
        OR: [
          { isPublic: true },
          { accessLevel: 'PUBLIC' },
          {
            AND: [
              { accessLevel: 'PARTICIPANTS' },
              {
                meeting: {
                  participants: {
                    some: { userId, leftAt: null }
                  }
                }
              }
            ]
          },
          {
            AND: [
              { accessLevel: 'CREATOR_ONLY' },
              { meeting: { createdById: userId } }
            ]
          }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    return transcripts;
  }

  async updateTranscriptAccess(
    transcriptId: string,
    userId: string,
    isPublic?: boolean,
    accessLevel?: 'CREATOR_ONLY' | 'PARTICIPANTS' | 'PROJECT_MEMBERS' | 'INSTITUTION' | 'PUBLIC'
  ) {
    const transcript = await this.prisma.meetingTranscript.findUnique({
      where: { id: transcriptId },
      include: {
        meeting: true
      }
    });

    if (!transcript) {
      throw new NotFoundException('Transcript not found');
    }

    if (transcript.meeting.createdById !== userId) {
      throw new ForbiddenException('Only meeting creator can update transcript access');
    }

    return this.prisma.meetingTranscript.update({
      where: { id: transcriptId },
      data: {
        ...(isPublic !== undefined && { isPublic }),
        ...(accessLevel && { accessLevel })
      }
    });
  }
}

