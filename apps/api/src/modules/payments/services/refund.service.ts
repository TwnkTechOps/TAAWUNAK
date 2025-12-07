import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { PaymentGatewayService } from './payment-gateway.service';
import { AuditService } from './audit.service';

@Injectable()
export class RefundService {
  constructor(
    private prisma: PrismaService,
    private paymentGateway: PaymentGatewayService,
    private auditService: AuditService
  ) {}

  /**
   * Create a refund request
   */
  async createRefund(
    userId: string,
    transactionId: string,
    amount: number,
    reason: string,
    description?: string
  ) {
    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { gateway: true }
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new BadRequestException('Unauthorized: Transaction does not belong to user');
    }

    if (transaction.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed transactions can be refunded');
    }

    if (amount > transaction.amount) {
      throw new BadRequestException('Refund amount cannot exceed transaction amount');
    }

    // Check existing refunds
    const existingRefunds = await this.prisma.refund.findMany({
      where: { transactionId }
    });

    const totalRefunded = existingRefunds
      .filter(r => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + r.amount, 0);

    if (totalRefunded + amount > transaction.amount) {
      throw new BadRequestException('Total refund amount cannot exceed transaction amount');
    }

    const refundId = this.generateRefundId();

    const refund = await this.prisma.refund.create({
      data: {
        refundId,
        transactionId,
        userId,
        amount,
        currency: transaction.currency,
        reason: reason as any,
        description,
        status: 'PENDING'
      }
    });

    // Process refund through gateway
    try {
      // This would call the gateway's refund method
      // For MVP, we'll mark it as processing
      const updatedRefund = await this.prisma.refund.update({
        where: { id: refund.id },
        data: {
          status: 'PROCESSING'
        }
      });

      await this.auditService.logTransaction(transactionId, 'REFUNDED', userId, {
        refundId: refund.id,
        amount,
        reason
      });

      return updatedRefund;
    } catch (error) {
      await this.prisma.refund.update({
        where: { id: refund.id },
        data: {
          status: 'FAILED'
        }
      });
      throw error;
    }
  }

  /**
   * Get user refunds
   */
  async getUserRefunds(userId: string, status?: string) {
    const refunds = await this.prisma.refund.findMany({
      where: {
        userId,
        ...(status && { status: status as any })
      },
      include: {
        transaction: {
          include: {
            gateway: {
              select: { name: true, displayName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return refunds;
  }

  /**
   * Create a dispute
   */
  async createDispute(
    userId: string,
    transactionId: string,
    type: string,
    reason: string,
    description: string,
    evidence?: any
  ) {
    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new BadRequestException('Unauthorized: Transaction does not belong to user');
    }

    const disputeId = this.generateDisputeId();

    const dispute = await this.prisma.dispute.create({
      data: {
        disputeId,
        transactionId,
        userId,
        type: type as any,
        reason: reason as any,
        description,
        status: 'OPEN',
        evidence: evidence || {}
      }
    });

    // Update transaction status
    await this.prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: 'DISPUTED'
      }
    });

    return dispute;
  }

  /**
   * Get user disputes
   */
  async getUserDisputes(userId: string, status?: string) {
    const disputes = await this.prisma.dispute.findMany({
      where: {
        userId,
        ...(status && { status: status as any })
      },
      include: {
        transaction: {
          include: {
            gateway: {
              select: { name: true, displayName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return disputes;
  }

  /**
   * Generate refund ID
   */
  private generateRefundId(): string {
    return `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  /**
   * Generate dispute ID
   */
  private generateDisputeId(): string {
    return `DSP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}

