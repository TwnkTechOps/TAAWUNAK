import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { AuditService } from './audit.service';

@Injectable()
export class BillingService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  /**
   * Create an invoice
   */
  async createInvoice(
    userId: string,
    institutionId: string | null,
    amount: number,
    currency: string,
    items: any[],
    dueDate: Date,
    notes?: string
  ) {
    const invoiceNumber = this.generateInvoiceNumber();

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        userId: userId || null,
        institutionId: institutionId || null,
        amount,
        currency,
        taxAmount: amount * 0.15, // 15% VAT for KSA
        totalAmount: amount * 1.15,
        status: 'DRAFT',
        dueDate,
        items,
        notes
      }
    });

    return invoice;
  }

  /**
   * Send invoice to customer
   */
  async sendInvoice(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId }
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'SENT'
      }
    });

    return updatedInvoice;
  }

  /**
   * Mark invoice as paid
   */
  async markInvoiceAsPaid(invoiceId: string, transactionId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId }
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date()
      }
    });

    // Link transaction to invoice
    await this.prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        invoiceId: invoiceId
      }
    });

    return updatedInvoice;
  }

  /**
   * Get user invoices
   */
  async getUserInvoices(userId: string, status?: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        userId,
        ...(status && { status: status as any })
      },
      orderBy: { createdAt: 'desc' },
      include: {
        transactions: {
          select: {
            id: true,
            status: true,
            amount: true,
            createdAt: true
          }
        }
      }
    });

    return invoices;
  }

  /**
   * Get institution invoices
   */
  async getInstitutionInvoices(institutionId: string, status?: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        institutionId,
        ...(status && { status: status as any })
      },
      orderBy: { createdAt: 'desc' },
      include: {
        transactions: {
          select: {
            id: true,
            status: true,
            amount: true,
            createdAt: true
          }
        }
      }
    });

    return invoices;
  }

  /**
   * Generate invoice number
   */
  private generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `INV-${year}${month}-${random}`;
  }
}

