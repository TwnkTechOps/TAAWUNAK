import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // ==================== Events ====================

  async createEvent(
    createdById: string,
    title: string,
    description: string,
    eventType: 'WORKSHOP' | 'HACKATHON' | 'CONFERENCE' | 'WEBINAR' | 'SEMINAR' | 'NETWORKING',
    startTime: Date,
    endTime: Date,
    timezone: string = 'UTC',
    location?: string,
    isVirtual: boolean = true,
    maxAttendees?: number,
    registrationRequired: boolean = false,
    registrationDeadline?: Date,
    isPublic: boolean = true,
    tags?: string[]
  ) {
    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    if (registrationDeadline && registrationDeadline >= startTime) {
      throw new BadRequestException('Registration deadline must be before event start time');
    }

    const event = await this.prisma.event.create({
      data: {
        title,
        description,
        eventType,
        startTime,
        endTime,
        timezone,
        location,
        isVirtual,
        maxAttendees,
        registrationRequired,
        registrationDeadline,
        isPublic,
        tags: tags || [],
        createdById
      },
      include: {
        createdBy: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        _count: {
          select: { registrations: true }
        }
      }
    });

    return event;
  }

  async getEvents(
    userId?: string,
    eventType?: string,
    isPublic?: boolean,
    upcoming?: boolean,
    search?: string
  ) {
    const where: any = {};

    if (eventType) {
      where.eventType = eventType;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    } else if (!userId) {
      // If no user, only show public events
      where.isPublic = true;
    }

    if (upcoming) {
      where.startTime = { gte: new Date() };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // If not public and user provided, show user's events or public ones
    if (!isPublic && userId) {
      where.OR = [
        { isPublic: true },
        { createdById: userId },
        {
          registrations: {
            some: { userId }
          }
        }
      ];
    }

    const events = await this.prisma.event.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    return events;
  }

  async getEvent(eventId: string, userId?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        createdBy: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        registrations: {
          where: userId ? { userId } : undefined,
          include: {
            user: {
              select: { id: true, email: true, fullName: true, role: true }
            }
          }
        },
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check access for private events
    if (!event.isPublic && event.createdById !== userId) {
      const isRegistered = event.registrations.some(r => r.userId === userId);
      if (!isRegistered) {
        throw new ForbiddenException('Access denied to this event');
      }
    }

    return event;
  }

  async updateEvent(
    eventId: string,
    userId: string,
    updates: {
      title?: string;
      description?: string;
      startTime?: Date;
      endTime?: Date;
      location?: string;
      maxAttendees?: number;
      registrationDeadline?: Date;
      tags?: string[];
    }
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.createdById !== userId) {
      throw new ForbiddenException('Only event creator can update event');
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: updates,
      include: {
        createdBy: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        _count: {
          select: { registrations: true }
        }
      }
    });
  }

  async deleteEvent(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.createdById !== userId) {
      throw new ForbiddenException('Only event creator can delete event');
    }

    await this.prisma.event.delete({
      where: { id: eventId }
    });

    return { success: true };
  }

  // ==================== Event Registration ====================

  async registerForEvent(eventId: string, userId: string) {
    const event = await this.getEvent(eventId, userId);

    // Check if registration is required
    if (event.registrationRequired) {
      if (event.registrationDeadline && new Date() > event.registrationDeadline) {
        throw new BadRequestException('Registration deadline has passed');
      }
    }

    // Check if event is full
    if (event.maxAttendees) {
      const currentRegistrations = await this.prisma.eventRegistration.count({
        where: {
          eventId,
          status: { in: ['REGISTERED', 'ATTENDED'] }
        }
      });

      if (currentRegistrations >= event.maxAttendees) {
        throw new BadRequestException('Event is full');
      }
    }

    // Check if already registered
    const existing = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });

    if (existing) {
      if (existing.status === 'REGISTERED' || existing.status === 'ATTENDED') {
        throw new BadRequestException('Already registered for this event');
      }
      if (existing.status === 'CANCELLED') {
        // Re-register
        return this.prisma.eventRegistration.update({
          where: { id: existing.id },
          data: {
            status: 'REGISTERED',
            registeredAt: new Date()
          },
          include: {
            user: {
              select: { id: true, email: true, fullName: true, role: true }
            },
            event: {
              select: { id: true, title: true, startTime: true }
            }
          }
        });
      }
    }

    return this.prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
        status: 'REGISTERED'
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        event: {
          select: { id: true, title: true, startTime: true }
        }
      }
    });
  }

  async cancelRegistration(eventId: string, userId: string) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.status === 'CANCELLED') {
      throw new BadRequestException('Registration already cancelled');
    }

    return this.prisma.eventRegistration.update({
      where: { id: registration.id },
      data: {
        status: 'CANCELLED'
      }
    });
  }

  async checkIn(eventId: string, userId: string, checkedInById: string) {
    const event = await this.getEvent(eventId, checkedInById);

    // Only creator or user themselves can check in
    if (event.createdById !== checkedInById && userId !== checkedInById) {
      throw new ForbiddenException('Cannot check in this user');
    }

    const registration = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });

    if (!registration) {
      throw new NotFoundException('User is not registered for this event');
    }

    return this.prisma.eventRegistration.update({
      where: { id: registration.id },
      data: {
        status: 'ATTENDED',
        attended: true,
        checkedInAt: new Date()
      }
    });
  }

  async getRegistrations(eventId: string, userId: string) {
    const event = await this.getEvent(eventId, userId);

    // Only creator can see all registrations
    if (event.createdById !== userId) {
      throw new ForbiddenException('Only event creator can view all registrations');
    }

    return this.prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        }
      },
      orderBy: { registeredAt: 'asc' }
    });
  }

  async addRecording(eventId: string, userId: string, recordingUrl: string) {
    const event = await this.getEvent(eventId, userId);

    if (event.createdById !== userId) {
      throw new ForbiddenException('Only event creator can add recordings');
    }

    const recordings = event.recordings || [];
    recordings.push(recordingUrl);

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        recordings
      }
    });
  }
}

