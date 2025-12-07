import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log transaction audit event
   */
  async logTransaction(
    transactionId: string,
    action: string,
    performedBy?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    await this.prisma.transactionAudit.create({
      data: {
        transactionId,
        action: action as any,
        performedBy: performedBy || null,
        details: details || {},
        ipAddress: ipAddress || null,
        userAgent: userAgent || null
      }
    });
  }

  /**
   * Get transaction audit log
   */
  async getTransactionAudit(transactionId: string) {
    return this.prisma.transactionAudit.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    return this.prisma.transactionAudit.findMany({
      where: {
        ...(filters.userId && {
          transaction: {
            userId: filters.userId
          }
        }),
        ...(filters.action && { action: filters.action as any }),
        ...(filters.startDate && filters.endDate && {
          createdAt: {
            gte: filters.startDate,
            lte: filters.endDate
          }
        })
      },
      include: {
        transaction: {
          select: {
            id: true,
            transactionId: true,
            amount: true,
            currency: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100
    });
  }
}

