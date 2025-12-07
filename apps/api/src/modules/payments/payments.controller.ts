import { Controller, Get, Post, Put, Delete, Param, Body, Request, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { WalletService } from './services/wallet.service';
import { BillingService } from './services/billing.service';
import { RefundService } from './services/refund.service';
import { AuditService } from './services/audit.service';
import { PrismaService } from '../../services/prisma.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private paymentGateway: PaymentGatewayService,
    private wallet: WalletService,
    private billing: BillingService,
    private refund: RefundService,
    private audit: AuditService,
    private prisma: PrismaService
  ) {}

  // ==================== Payment Gateways ====================

  @Get('gateways')
  async getAvailableGateways(@Query('currency') currency?: string, @Query('all') all?: string) {
    if (all === 'true') {
      // Return all gateways (for admin/gateways page)
      return this.prisma.paymentGateway.findMany({
        orderBy: { displayName: 'asc' }
      });
    }
    return this.paymentGateway.getAvailableGateways(currency || 'SAR');
  }

  @Post('process')
  async processPayment(
    @Request() req: any,
    @Body() body: {
      gatewayName: string;
      amount: number;
      currency?: string;
      paymentMethod: string;
      paymentType: string;
      description?: string;
      metadata?: any;
    }
  ) {
    return this.paymentGateway.processPayment(
      req.user.id,
      body.gatewayName,
      body.amount,
      body.currency || 'SAR',
      body.paymentMethod,
      body.paymentType,
      body.description,
      body.metadata
    );
  }

  // ==================== Wallet Management ====================

  @Get('wallet')
  async getWallet(@Request() req: any) {
    return this.wallet.getBalance(req.user.id);
  }

  @Get('wallet/transactions')
  async getWalletTransactions(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string
  ) {
    return this.wallet.getTransactions(req.user.id, parseInt(limit || '50'), cursor);
  }

  @Post('wallet/top-up')
  async topUpWallet(
    @Request() req: any,
    @Body() body: { amount: number; currency?: string; description?: string }
  ) {
    return this.wallet.addFunds(
      req.user.id,
      body.amount,
      body.currency || 'SAR',
      body.description
    );
  }

  // ==================== Transactions ====================

  @Get('transactions')
  async getTransactions(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string
  ) {
    return this.prisma.paymentTransaction.findMany({
      where: {
        userId: req.user.id,
        ...(status && { status: status as any })
      },
      include: {
        gateway: {
          select: { name: true, displayName: true }
        },
        invoice: {
          select: { invoiceNumber: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit || '50'),
      ...(cursor && { cursor: { id: cursor }, skip: 1 })
    });
  }

  @Get('transactions/:id')
  async getTransaction(@Request() req: any, @Param('id') id: string) {
    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { id },
      include: {
        gateway: true,
        invoice: true,
        subscription: true,
        project: {
          select: { id: true, title: true }
        },
        refunds: true,
        disputes: true,
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!transaction || transaction.userId !== req.user.id) {
      throw new Error('Transaction not found or unauthorized');
    }

    return transaction;
  }

  // ==================== Invoices ====================

  @Get('invoices')
  async getInvoices(
    @Request() req: any,
    @Query('status') status?: string
  ) {
    return this.billing.getUserInvoices(req.user.id, status);
  }

  @Get('invoices/:id')
  async getInvoice(@Request() req: any, @Param('id') id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        transactions: true,
        user: {
          select: { id: true, email: true, fullName: true }
        },
        institution: {
          select: { id: true, name: true }
        }
      }
    });

    if (!invoice || invoice.userId !== req.user.id) {
      throw new Error('Invoice not found or unauthorized');
    }

    return invoice;
  }

  @Post('invoices')
  async createInvoice(
    @Request() req: any,
    @Body() body: {
      institutionId?: string;
      amount: number;
      currency?: string;
      items: any[];
      dueDate: string;
      notes?: string;
    }
  ) {
    return this.billing.createInvoice(
      req.user.id,
      body.institutionId || null,
      body.amount,
      body.currency || 'SAR',
      body.items,
      new Date(body.dueDate),
      body.notes
    );
  }

  // ==================== Refunds ====================

  @Get('refunds')
  async getRefunds(
    @Request() req: any,
    @Query('status') status?: string
  ) {
    return this.refund.getUserRefunds(req.user.id, status);
  }

  @Post('refunds')
  async createRefund(
    @Request() req: any,
    @Body() body: {
      transactionId: string;
      amount: number;
      reason: string;
      description?: string;
    }
  ) {
    return this.refund.createRefund(
      req.user.id,
      body.transactionId,
      body.amount,
      body.reason,
      body.description
    );
  }

  // ==================== Disputes ====================

  @Get('disputes')
  async getDisputes(
    @Request() req: any,
    @Query('status') status?: string
  ) {
    return this.refund.getUserDisputes(req.user.id, status);
  }

  @Post('disputes')
  async createDispute(
    @Request() req: any,
    @Body() body: {
      transactionId: string;
      type: string;
      reason: string;
      description: string;
      evidence?: any;
    }
  ) {
    return this.refund.createDispute(
      req.user.id,
      body.transactionId,
      body.type,
      body.reason,
      body.description,
      body.evidence
    );
  }

  // ==================== Audit ====================

  @Get('transactions/:id/audit')
  async getTransactionAudit(@Request() req: any, @Param('id') id: string) {
    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { id }
    });

    if (!transaction || transaction.userId !== req.user.id) {
      throw new Error('Transaction not found or unauthorized');
    }

    return this.audit.getTransactionAudit(id);
  }
}

