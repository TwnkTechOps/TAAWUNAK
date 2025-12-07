import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';

interface FraudCheckResult {
  isFraudulent: boolean;
  score: number;
  reason?: string;
  alerts?: string[];
}

@Injectable()
export class FraudDetectionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check transaction for fraud
   */
  async checkTransaction(transaction: any): Promise<FraudCheckResult> {
    let score = 0;
    const alerts: string[] = [];

    // Check 1: Unusual amount
    const avgAmount = await this.getAverageTransactionAmount(transaction.userId);
    if (avgAmount > 0 && transaction.amount > avgAmount * 3) {
      score += 30;
      alerts.push('UNUSUAL_AMOUNT');
    }

    // Check 2: Transaction frequency
    const recentCount = await this.getRecentTransactionCount(transaction.userId, 60); // Last 60 minutes
    if (recentCount > 10) {
      score += 25;
      alerts.push('UNUSUAL_FREQUENCY');
    }

    // Check 3: Velocity check (multiple transactions in short time)
    const velocityCount = await this.getRecentTransactionCount(transaction.userId, 5); // Last 5 minutes
    if (velocityCount > 3) {
      score += 35;
      alerts.push('CARD_VELOCITY');
    }

    // Check 4: Check for existing fraud alerts
    const recentAlerts = await this.prisma.fraudAlert.count({
      where: {
        userId: transaction.userId,
        status: 'ACTIVE',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    if (recentAlerts > 0) {
      score += 20;
      alerts.push('ACCOUNT_COMPROMISE');
    }

    const isFraudulent = score >= 50; // Threshold

    if (isFraudulent) {
      // Create fraud alert
      await this.prisma.fraudAlert.create({
        data: {
          transactionId: transaction.id,
          userId: transaction.userId,
          alertType: this.determineAlertType(alerts),
          severity: score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : 'MEDIUM',
          score,
          description: `Fraud detected: ${alerts.join(', ')}`,
          status: 'ACTIVE'
        }
      });
    }

    return {
      isFraudulent,
      score,
      reason: alerts.length > 0 ? alerts.join(', ') : undefined,
      alerts: alerts.length > 0 ? alerts : undefined
    };
  }

  /**
   * Get average transaction amount for user
   */
  private async getAverageTransactionAmount(userId: string): Promise<number> {
    const result = await this.prisma.paymentTransaction.aggregate({
      where: {
        userId,
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      _avg: {
        amount: true
      }
    });

    return result._avg.amount || 0;
  }

  /**
   * Get recent transaction count
   */
  private async getRecentTransactionCount(userId: string, minutes: number): Promise<number> {
    return this.prisma.paymentTransaction.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - minutes * 60 * 1000)
        }
      }
    });
  }

  /**
   * Determine alert type from alerts array
   */
  private determineAlertType(alerts: string[]): 'CARD_VELOCITY' | 'UNUSUAL_FREQUENCY' | 'UNUSUAL_AMOUNT' | 'ACCOUNT_COMPROMISE' | 'PATTERN_ANOMALY' {
    if (alerts.includes('CARD_VELOCITY')) return 'CARD_VELOCITY';
    if (alerts.includes('UNUSUAL_FREQUENCY')) return 'UNUSUAL_FREQUENCY';
    if (alerts.includes('UNUSUAL_AMOUNT')) return 'UNUSUAL_AMOUNT';
    if (alerts.includes('ACCOUNT_COMPROMISE')) return 'ACCOUNT_COMPROMISE';
    return 'PATTERN_ANOMALY';
  }
}

