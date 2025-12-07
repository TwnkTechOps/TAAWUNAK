import { Controller, Get, Post, Put, Delete, Param, Body, Request, UseGuards, Query } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  async createMeeting(
    @Request() req: any,
    @Body() body: {
      title: string;
      description: string;
      startTime: string;
      endTime: string;
      meetingType?: 'PLATFORM' | 'ZOOM' | 'TEAMS' | 'GOOGLE_MEET';
      projectId?: string;
    }
  ) {
    return this.meetingsService.createMeeting(
      req.user.id,
      body.title,
      body.description,
      new Date(body.startTime),
      new Date(body.endTime),
      body.meetingType || 'PLATFORM',
      body.projectId
    );
  }

  @Get()
  async getMeetings(
    @Request() req: any,
    @Query('projectId') projectId?: string,
    @Query('upcoming') upcoming?: string
  ) {
    return this.meetingsService.getMeetings(
      req.user.id,
      projectId,
      upcoming === 'true'
    );
  }

  @Get(':id')
  async getMeeting(@Request() req: any, @Param('id') id: string) {
    return this.meetingsService.getMeeting(id, req.user.id);
  }

  @Post(':id/participants')
  async addParticipant(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { userId: string }
  ) {
    return this.meetingsService.addParticipant(id, body.userId, req.user.id);
  }

  @Delete(':id/participants/:userId')
  async removeParticipant(
    @Request() req: any,
    @Param('id') id: string,
    @Param('userId') userId: string
  ) {
    return this.meetingsService.removeParticipant(id, userId, req.user.id);
  }

  @Post(':id/recording/start')
  async startRecording(@Request() req: any, @Param('id') id: string) {
    return this.meetingsService.startRecording(id, req.user.id);
  }

  @Post(':id/recording/stop')
  async stopRecording(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { recordingUrl: string }
  ) {
    return this.meetingsService.stopRecording(id, req.user.id, body.recordingUrl);
  }

  @Post(':id/transcripts')
  async createTranscript(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: {
      content: string;
      summary: string;
      language?: string;
      isPublic?: boolean;
      accessLevel?: 'CREATOR_ONLY' | 'PARTICIPANTS' | 'PROJECT_MEMBERS' | 'INSTITUTION' | 'PUBLIC';
    }
  ) {
    return this.meetingsService.createTranscript(
      id,
      body.content,
      body.summary,
      body.language || 'en',
      body.isPublic || false,
      body.accessLevel || 'PARTICIPANTS',
      req.user.id
    );
  }

  @Get(':id/transcripts')
  async getTranscripts(@Request() req: any, @Param('id') id: string) {
    return this.meetingsService.getTranscripts(id, req.user.id);
  }

  @Put('transcripts/:transcriptId/access')
  async updateTranscriptAccess(
    @Request() req: any,
    @Param('transcriptId') transcriptId: string,
    @Body() body: {
      isPublic?: boolean;
      accessLevel?: 'CREATOR_ONLY' | 'PARTICIPANTS' | 'PROJECT_MEMBERS' | 'INSTITUTION' | 'PUBLIC';
    }
  ) {
    return this.meetingsService.updateTranscriptAccess(
      transcriptId,
      req.user.id,
      body.isPublic,
      body.accessLevel
    );
  }
}

