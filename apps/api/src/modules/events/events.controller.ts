import { Controller, Get, Post, Put, Delete, Param, Body, Request, UseGuards, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async createEvent(
    @Request() req: any,
    @Body() body: {
      title: string;
      description: string;
      eventType: 'WORKSHOP' | 'HACKATHON' | 'CONFERENCE' | 'WEBINAR' | 'SEMINAR' | 'NETWORKING';
      startTime: string;
      endTime: string;
      timezone?: string;
      location?: string;
      isVirtual?: boolean;
      maxAttendees?: number;
      registrationRequired?: boolean;
      registrationDeadline?: string;
      isPublic?: boolean;
      tags?: string[];
    }
  ) {
    return this.eventsService.createEvent(
      req.user.id,
      body.title,
      body.description,
      body.eventType,
      new Date(body.startTime),
      new Date(body.endTime),
      body.timezone || 'UTC',
      body.location,
      body.isVirtual !== false,
      body.maxAttendees,
      body.registrationRequired || false,
      body.registrationDeadline ? new Date(body.registrationDeadline) : undefined,
      body.isPublic !== false,
      body.tags
    );
  }

  @Get()
  async getEvents(
    @Request() req: any,
    @Query('eventType') eventType?: string,
    @Query('isPublic') isPublic?: string,
    @Query('upcoming') upcoming?: string,
    @Query('search') search?: string
  ) {
    return this.eventsService.getEvents(
      req.user?.id,
      eventType,
      isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
      upcoming === 'true',
      search
    );
  }

  @Get(':id')
  async getEvent(@Request() req: any, @Param('id') id: string) {
    return this.eventsService.getEvent(id, req.user?.id);
  }

  @Put(':id')
  async updateEvent(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: {
      title?: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      location?: string;
      maxAttendees?: number;
      registrationDeadline?: string;
      tags?: string[];
    }
  ) {
    return this.eventsService.updateEvent(id, req.user.id, {
      ...body,
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : undefined
    });
  }

  @Delete(':id')
  async deleteEvent(@Request() req: any, @Param('id') id: string) {
    return this.eventsService.deleteEvent(id, req.user.id);
  }

  @Post(':id/register')
  async registerForEvent(@Request() req: any, @Param('id') id: string) {
    return this.eventsService.registerForEvent(id, req.user.id);
  }

  @Post(':id/cancel')
  async cancelRegistration(@Request() req: any, @Param('id') id: string) {
    return this.eventsService.cancelRegistration(id, req.user.id);
  }

  @Post(':id/check-in/:userId')
  async checkIn(
    @Request() req: any,
    @Param('id') id: string,
    @Param('userId') userId: string
  ) {
    return this.eventsService.checkIn(id, userId, req.user.id);
  }

  @Get(':id/registrations')
  async getRegistrations(@Request() req: any, @Param('id') id: string) {
    return this.eventsService.getRegistrations(id, req.user.id);
  }

  @Post(':id/recordings')
  async addRecording(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { recordingUrl: string }
  ) {
    return this.eventsService.addRecording(id, req.user.id, body.recordingUrl);
  }
}

