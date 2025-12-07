import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { AuditService } from './audit.service';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  /**
   * Get or create user wallet
   */
  async getOrCreateWallet(userId: string, walletType: string = 'USER') {
    let wallet = await this.prisma.digitalWallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      wallet = await this.prisma.digitalWallet.create({
        data: {
          userId,
          balance: 0.0,
          currency: 'SAR',
          walletType: walletType as any,
          isActive: true
        }
      });
    }

    return wallet;
  }

  /**
   * Get wallet balance
   */
  async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      balance: wallet.balance,
      currency: wallet.currency,
      isActive: wallet.isActive
    };
  }

  /**
   * Add funds to wallet
   */
  async addFunds(userId: string, amount: number, currency: string = 'SAR', description?: string) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const wallet = await this.getOrCreateWallet(userId);

    const updatedWallet = await this.prisma.digitalWallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: amount
        }
      }
    });

    // Create transaction record
    await this.prisma.paymentTransaction.create({
      data: {
        transactionId: `WALLET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        walletId: wallet.id,
        gatewayId: (await this.prisma.paymentGateway.findFirst({ where: { name: 'STC_PAY' } }))?.id || '',
        amount,
        currency,
        status: 'COMPLETED',
        paymentMethod: 'WALLET',
        paymentType: 'CUSTOM',
        description: description || 'Wallet top-up',
        completedAt: new Date()
      }
    });

    return updatedWallet;
  }

  /**
   * Deduct funds from wallet
   */
  async deductFunds(userId: string, amount: number, description?: string) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const updatedWallet = await this.prisma.digitalWallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          decrement: amount
        }
      }
    });

    return updatedWallet;
  }

  /**
   * Get wallet transactions
   */
  async getTransactions(userId: string, limit: number = 50, cursor?: string) {
    const wallet = await this.getOrCreateWallet(userId);

    const transactions = await this.prisma.paymentTransaction.findMany({
      where: {
        walletId: wallet.id
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: {
        gateway: {
          select: { name: true, displayName: true }
        }
      }
    });

    return transactions;
  }
}

