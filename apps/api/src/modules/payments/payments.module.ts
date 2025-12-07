import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { WalletService } from './services/wallet.service';
import { BillingService } from './services/billing.service';
import { RefundService } from './services/refund.service';
import { AuditService } from './services/audit.service';
import { FraudDetectionService } from './services/fraud-detection.service';
import { PrismaService } from '../../services/prisma.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentGatewayService,
    WalletService,
    BillingService,
    RefundService,
    AuditService,
    FraudDetectionService,
    PrismaService
  ],
  exports: [
    PaymentGatewayService,
    WalletService,
    BillingService,
    RefundService,
    AuditService,
    FraudDetectionService
  ]
})
export class PaymentsModule {}

