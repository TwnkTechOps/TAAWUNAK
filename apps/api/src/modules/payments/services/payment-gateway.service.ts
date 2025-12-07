import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { IPaymentGateway, ProcessPaymentData, PaymentResponse } from '../gateways/base-gateway.interface';
import { STCPayGateway } from '../gateways/stc-pay.gateway';
import { MadaGateway } from '../gateways/mada.gateway';
import { PayTabsGateway } from '../gateways/paytabs.gateway';
import { VisaGateway } from '../gateways/visa.gateway';
import { MastercardGateway } from '../gateways/mastercard.gateway';
import { FraudDetectionService } from './fraud-detection.service';
import { AuditService } from './audit.service';

@Injectable()
export class PaymentGatewayService {
  private gateways: Map<string, IPaymentGateway> = new Map();

  constructor(
    private prisma: PrismaService,
    private fraudDetection: FraudDetectionService,
    private auditService: AuditService
  ) {
    this.initializeGateways();
  }

  /**
   * Initialize all payment gateways
   */
  private async initializeGateways() {
    const gatewayConfigs = await this.prisma.paymentGateway.findMany({
      where: { isActive: true }
    });

    for (const config of gatewayConfigs) {
      const gateway = this.createGatewayInstance(config.name);
      if (gateway) {
        this.gateways.set(config.name, gateway);
      }
    }
  }

  /**
   * Create gateway instance based on name
   */
  private createGatewayInstance(name: string): IPaymentGateway | null {
    switch (name) {
      case 'STC_PAY':
        return new STCPayGateway();
      case 'MADA':
        return new MadaGateway();
      case 'PAYTABS':
        return new PayTabsGateway();
      case 'VISA':
        return new VisaGateway();
      case 'MASTERCARD':
        return new MastercardGateway();
      default:
        return null;
    }
  }

  /**
   * Tokenize card data
   */
  async tokenizeCard(gatewayName: string, cardData: any) {
    const gateway = this.gateways.get(gatewayName);
    if (!gateway) {
      throw new NotFoundException(`Gateway ${gatewayName} not found`);
    }

    if (!gateway.getConfig().supportsTokenization) {
      throw new BadRequestException(`Gateway ${gatewayName} does not support tokenization`);
    }

    return gateway.tokenizeCard(cardData);
  }

  /**
   * Initiate 3D Secure authentication
   */
  async initiate3DSecure(gatewayName: string, transactionId: string, returnUrl: string) {
    const gateway = this.gateways.get(gatewayName);
    if (!gateway) {
      throw new NotFoundException(`Gateway ${gatewayName} not found`);
    }

    if (!gateway.getConfig().supports3DSecure) {
      throw new BadRequestException(`Gateway ${gatewayName} does not support 3D Secure`);
    }

    return gateway.initiate3DSecure(transactionId, returnUrl);
  }

  /**
   * Handle webhook from payment gateway
   */
  async handleWebhook(gatewayName: string, payload: any, signature?: string) {
    const gateway = this.gateways.get(gatewayName);
    if (!gateway) {
      throw new NotFoundException(`Gateway ${gatewayName} not found`);
    }

    const webhookResponse = await gateway.handleWebhook(payload, signature);

    // Update transaction status based on webhook
    if (webhookResponse.processed && webhookResponse.transactionId) {
      const transaction = await this.prisma.paymentTransaction.findFirst({
        where: {
          OR: [
            { transactionId: webhookResponse.transactionId },
            { gatewayTransactionId: webhookResponse.transactionId }
          ]
        }
      });

      if (transaction) {
        await this.prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: {
            status: webhookResponse.status as any,
            completedAt: webhookResponse.status === 'COMPLETED' ? new Date() : null,
            failedAt: webhookResponse.status === 'FAILED' ? new Date() : null,
            gatewayResponse: webhookResponse.metadata
          }
        });

        await this.auditService.logTransaction(transaction.id, 'WEBHOOK_RECEIVED', transaction.userId || undefined, {
          eventType: webhookResponse.eventType,
          status: webhookResponse.status
        });
      }
    }

    return webhookResponse;
  }

  /**
   * Process a payment transaction
   */
  async processPayment(
    userId: string,
    gatewayName: string,
    amount: number,
    currency: string,
    paymentMethod: string,
    paymentType: string,
    description?: string,
    metadata?: Record<string, any>
  ) {
    // Get gateway configuration
    const gatewayConfig = await this.prisma.paymentGateway.findUnique({
      where: { name: gatewayName as any }
    });

    if (!gatewayConfig || !gatewayConfig.isActive) {
      throw new NotFoundException(`Payment gateway ${gatewayName} not found or inactive`);
    }

    // Validate amount
    if (gatewayConfig.minAmount && amount < gatewayConfig.minAmount) {
      throw new BadRequestException(`Amount must be at least ${gatewayConfig.minAmount} ${currency}`);
    }
    if (gatewayConfig.maxAmount && amount > gatewayConfig.maxAmount) {
      throw new BadRequestException(`Amount must not exceed ${gatewayConfig.maxAmount} ${currency}`);
    }

    // Get user info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get gateway instance
    const gateway = this.gateways.get(gatewayName);
    if (!gateway) {
      throw new NotFoundException(`Gateway ${gatewayName} not initialized`);
    }

    // Create transaction record
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        transactionId: this.generateTransactionId(),
        userId,
        gatewayId: gatewayConfig.id,
        amount,
        currency,
        status: 'PENDING',
        paymentMethod: paymentMethod as any,
        paymentType: paymentType as any,
        description,
        metadata: metadata || {}
      }
    });

    // Fraud detection
    const fraudCheck = await this.fraudDetection.checkTransaction(transaction);
    if (fraudCheck.isFraudulent) {
      await this.prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED',
          fraudScore: fraudCheck.score,
          failedAt: new Date()
        }
      });

      await this.auditService.logTransaction(transaction.id, 'FRAUD_CHECKED', userId || undefined, {
        fraudScore: fraudCheck.score,
        reason: fraudCheck.reason
      });

      throw new BadRequestException('Transaction flagged by fraud detection');
    }

    // Process payment through gateway
    try {
      const paymentData: ProcessPaymentData = {
        amount,
        currency,
        paymentMethod,
        returnUrl: metadata?.returnUrl,
        webhookUrl: metadata?.webhookUrl,
        customerInfo: {
          userId: user.id,
          email: user.email,
          name: user.fullName
        },
        metadata: metadata || {}
      };

      const response = await gateway.processPayment(paymentData);

      // Update transaction
      const updatedTransaction = await this.prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: response.success ? 'PROCESSING' : 'FAILED',
          gatewayTransactionId: response.gatewayTransactionId,
          gatewayResponse: response as any, // JSON field
          completedAt: response.success ? new Date() : null,
          failedAt: response.success ? null : new Date()
        }
      });

      await this.auditService.logTransaction(transaction.id, 'PROCESSED', userId, {
        gateway: gatewayName,
        response: response
      });

      return updatedTransaction;
    } catch (error) {
      await this.prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          gatewayResponse: { error: error instanceof Error ? error.message : String(error) }
        }
      });

      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.auditService.logTransaction(transaction.id, 'FAILED', userId || undefined, {
        error: errorMessage
      });

      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get available payment gateways
   */
  async getAvailableGateways(currency: string = 'SAR') {
    const gateways = await this.prisma.paymentGateway.findMany({
      where: {
        isActive: true,
        supportedCurrencies: {
          has: currency
        }
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        feePercentage: true,
        minAmount: true,
        maxAmount: true,
        supportedCurrencies: true
      }
    });

    return gateways;
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}

