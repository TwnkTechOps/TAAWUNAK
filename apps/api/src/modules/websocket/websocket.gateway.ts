import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {JwtService} from '@nestjs/jwt';
import {PrismaService} from '../../services/prisma.service';

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_ORIGIN || 'http://localhost:4320',
    credentials: true,
  },
})
export class CommunicationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (token) {
        const payload = this.jwtService.verify(token);
        client.data.userId = payload.id;
        client.data.userRole = payload.role;
      }
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Cleanup if needed
  }

  @SubscribeMessage('join-project')
  async handleJoinProject(@ConnectedSocket() client: Socket, @MessageBody() data: {projectId: string}) {
    if (!client.data.userId) {
      return {error: 'Unauthorized'};
    }

    // Verify project access
    const hasAccess = await this.verifyProjectAccess(data.projectId, client.data.userId, client.data.userRole);
    if (!hasAccess) {
      return {error: 'Access denied'};
    }

    client.join(`project:${data.projectId}`);
    return {success: true, projectId: data.projectId};
  }

  @SubscribeMessage('leave-project')
  handleLeaveProject(@ConnectedSocket() client: Socket, @MessageBody() data: {projectId: string}) {
    client.leave(`project:${data.projectId}`);
    return {success: true};
  }

  @SubscribeMessage('send-message')
  async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: {projectId: string; content: string; parentId?: string}) {
    if (!client.data.userId) {
      return {error: 'Unauthorized'};
    }

    // Verify project access
    const hasAccess = await this.verifyProjectAccess(data.projectId, client.data.userId, client.data.userRole);
    if (!hasAccess) {
      return {error: 'Access denied'};
    }

    // Save message to database
    const message = await (this.prisma as any).projectMessage.create({
      data: {
        projectId: data.projectId,
        userId: client.data.userId,
        content: data.content,
        parentId: data.parentId,
        threadId: data.parentId || undefined,
      },
      include: {
        user: {select: {id: true, email: true, fullName: true}},
      },
    });

    // Broadcast to all clients in the project room
    this.server.to(`project:${data.projectId}`).emit('new-message', message);

    // Create notifications for participants
    await this.notifyParticipants(data.projectId, client.data.userId, 'MESSAGE', `New message in project`);

    return {success: true, message};
  }

  @SubscribeMessage('send-announcement')
  async handleAnnouncement(@ConnectedSocket() client: Socket, @MessageBody() data: {projectId: string; title: string; content: string; priority?: string}) {
    if (!client.data.userId) {
      return {error: 'Unauthorized'};
    }

    // Verify project access and ownership
    const project = await this.prisma.project.findUnique({
      where: {id: data.projectId},
    });

    if (!project || (project.ownerId !== client.data.userId && client.data.userRole !== 'ADMIN')) {
      return {error: 'Access denied'};
    }

    // Save announcement to database
    const announcement = await (this.prisma as any).projectAnnouncement.create({
      data: {
        projectId: data.projectId,
        userId: client.data.userId,
        title: data.title,
        content: data.content,
        priority: data.priority || 'NORMAL',
      },
      include: {
        user: {select: {id: true, email: true, fullName: true}},
      },
    });

    // Broadcast to all clients in the project room
    this.server.to(`project:${data.projectId}`).emit('new-announcement', announcement);

    // Create notifications
    await this.notifyParticipants(data.projectId, client.data.userId, 'SYSTEM', `New announcement: ${data.title}`);

    return {success: true, announcement};
  }

  private async verifyProjectAccess(projectId: string, userId: string, userRole?: string): Promise<boolean> {
    if (userRole === 'ADMIN') {
      return true;
    }

    const project = await this.prisma.project.findUnique({
      where: {id: projectId},
      include: {
        participants: {
          where: {userId, status: 'ACTIVE'},
        },
      },
    });

    if (!project) {
      return false;
    }

    if (project.ownerId === userId) {
      return true;
    }

    return (project as any).participants?.length > 0;
  }

  private async notifyParticipants(projectId: string, senderId: string, type: string, message: string) {
    const project = await this.prisma.project.findUnique({
      where: {id: projectId},
      include: {
        participants: {
          where: {status: 'ACTIVE', userId: {not: senderId}},
        },
      },
    });

    if (!project) return;

    const participants = (project as any).participants || [];

    for (const participant of participants) {
      await (this.prisma as any).notification.create({
        data: {
          userId: participant.userId,
          type,
          title: 'Project Update',
          message,
          link: `/projects/${projectId}`,
        },
      });

      // Emit notification to user if connected
      this.server.emit(`notification:${participant.userId}`, {
        type,
        title: 'Project Update',
        message,
        link: `/projects/${projectId}`,
      });
    }
  }
}
