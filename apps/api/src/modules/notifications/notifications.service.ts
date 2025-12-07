import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../services/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string, unreadOnly: boolean = false) {
    const where: any = {userId};
    if (unreadOnly) {
      where.read = false;
    }

    return (this.prisma as any).notification.findMany({
      where,
      orderBy: {createdAt: 'desc'},
      take: 50
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    return (this.prisma as any).notification.update({
      where: {id: notificationId, userId},
      data: {read: true, readAt: new Date()}
    });
  }

  async markAllAsRead(userId: string) {
    return (this.prisma as any).notification.updateMany({
      where: {userId, read: false},
      data: {read: true, readAt: new Date()}
    });
  }

  async getUnreadCount(userId: string) {
    return (this.prisma as any).notification.count({
      where: {userId, read: false}
    });
  }

  async create(userId: string, type: string, title: string, message: string, link?: string) {
    return (this.prisma as any).notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link
      }
    });
  }

  async delete(userId: string, notificationId: string) {
    return (this.prisma as any).notification.delete({
      where: {id: notificationId, userId}
    });
  }
}

