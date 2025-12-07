import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../services/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    actorUserId?: string;
    action: string;
    targetType?: string;
    targetId?: string;
    metadata?: any;
    ip?: string;
    ua?: string;
  }) {
    try {
      await this.prisma.auditEvent.create({
        data: {
          actorUserId: params.actorUserId,
          action: params.action,
          targetType: params.targetType,
          targetId: params.targetId,
          metadata: params.metadata,
          ip: params.ip,
          ua: params.ua
        }
      });
    } catch {
      // swallow to avoid breaking main path
    }
  }

  async list(limit = 100) {
    return this.prisma.auditEvent.findMany({
      orderBy: {createdAt: 'desc'},
      take: limit,
      include: {actor: {select: {email: true}}}
    });
  }
}

