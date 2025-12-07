import { IPaymentGateway, ProcessPaymentData, PaymentResponse, RefundData, RefundResponse, TransactionStatusResponse, GatewayConfig, WebhookResponse, TokenizationResponse, ThreeDSecureResponse, CardData } from './base-gateway.interface';

/**
 * Mada Gateway Implementation
 * Optimized to match Mada (Saudi Payments Network) API structure
 * 
 * Mada is the national debit card network in Saudi Arabia:
 * - Uses tokenization for PCI-DSS compliance
 * - Supports 3D Secure (3DS) authentication
 * - Real-time transaction processing
 * - Supports both debit and credit cards
 * 
 * Real API endpoints (when implemented):
 * - Sandbox: https://api.mada.com.sa/sandbox/v1/
 * - Production: https://api.mada.com.sa/v1/
 */
export class MadaGateway implements IPaymentGateway {
  private config: GatewayConfig = {
    name: 'MADA',
    displayName: 'Mada',
    isActive: false,
    isSandbox: true,
    supportedCurrencies: ['SAR'],
    supportedPaymentMethods: ['MADA', 'DEBIT_CARD', 'CREDIT_CARD'],
    feePercentage: 0.0, // Mada charges vary by merchant
    minAmount: 1.0,
    maxAmount: 100000.0,
    apiEndpoint: process.env.MADA_API_ENDPOINT || 'https://api.mada.com.sa/sandbox/v1',
    webhookEndpoint: process.env.MADA_WEBHOOK_ENDPOINT,
    supports3DSecure: true, // Mada requires 3DS for most transactions
    supportsTokenization: true, // PCI-DSS compliant tokenization
    supportsRecurring: true,
    requiresRedirect: true // For 3DS authentication
  };

  /**
   * Process Mada payment
   * Real flow: Tokenize card -> Initiate payment -> 3DS challenge if needed -> Complete
   */
  async processPayment(data: ProcessPaymentData): Promise<PaymentResponse> {
    // In production, this would:
    // 1. If cardData provided, tokenize first: POST /tokenize
    // 2. Initiate payment: POST /payment/initiate
    // 3. Check if 3DS required
    // 4. Return redirect URL for 3DS or direct completion

    const transactionId = `MADA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const gatewayTransactionId = `MADA${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // Mada typically requires 3DS for transactions > threshold
    const requires3DS = data.amount > 100 || !data.cardData?.token;

    if (requires3DS) {
      // Return 3DS redirect URL
      const redirectUrl = data.returnUrl 
        ? `${data.returnUrl}?transactionId=${transactionId}&gateway=MADA&requires3DS=true`
        : `https://3ds.mada.com.sa/challenge?transactionId=${gatewayTransactionId}`;

      return {
        success: true,
        transactionId,
        gatewayTransactionId,
        status: 'PENDING_3DS', // Awaiting 3DS authentication
        message: '3D Secure authentication required. Redirecting...',
        redirectUrl,
        metadata: {
          gateway: 'MADA',
          sandbox: this.config.isSandbox,
          requires3DS: true,
          // Real API would include:
          // acsUrl: response.data.acsUrl,
          // pareq: response.data.pareq,
          // md: response.data.md
        }
      };
    }

    // Direct payment (no 3DS required)
    return {
      success: true,
      transactionId,
      gatewayTransactionId,
      status: 'PROCESSING',
      message: 'Payment processing',
      metadata: {
        gateway: 'MADA',
        sandbox: this.config.isSandbox,
        requires3DS: false,
        // Real API would include:
        // authorizationCode: response.data.authorizationCode,
        // responseCode: response.data.responseCode
      }
    };
  }

  /**
   * Refund Mada transaction
   * Real flow: POST /refund with original transaction reference
   */
  async refundTransaction(refundData: RefundData): Promise<RefundResponse> {
    // In production, this would call: POST /refund
    // {
    //   "originalTransactionReference": refundData.originalTransactionId,
    //   "amount": refundData.amount,
    //   "reason": refundData.reason,
    //   "currency": "SAR"
    // }

    const refundId = `REF-MADA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const gatewayRefundId = `MADAREF${Date.now()}`;

    return {
      success: true,
      refundId,
      gatewayRefundId,
      status: 'PROCESSING',
      message: 'Refund initiated. Processing may take 3-5 business days.'
    };
  }

  /**
   * Verify Mada transaction status
   * Real flow: GET /transaction/{transactionId}/status
   */
  async verifyTransaction(transactionId: string): Promise<TransactionStatusResponse> {
    // In production, this would call: GET /transaction/{transactionId}/status
    // Response structure:
    // {
    //   "status": "SUCCESS" | "PENDING" | "FAILED" | "CANCELLED",
    //   "amount": 100.00,
    //   "currency": "SAR",
    //   "transactionReference": "...",
    //   "authorizationCode": "123456",
    //   "responseCode": "00",
    //   "timestamp": "2025-12-05T..."
    // }

    return {
      transactionId,
      status: 'COMPLETED',
      amount: 0,
      currency: 'SAR',
      gatewayTransactionId: `MADA${transactionId}`,
      metadata: {
        gateway: 'MADA',
        sandbox: this.config.isSandbox,
        // Real API would include:
        // authorizationCode: response.data.authorizationCode,
        // responseCode: response.data.responseCode,
        // cardLast4: response.data.cardLast4
      }
    };
  }

  /**
   * Handle Mada webhook
   * Real webhook payload structure:
   * {
   *   "event": "payment.completed" | "payment.failed" | "3ds.completed" | "refund.completed",
   *   "transactionReference": "...",
   *   "status": "SUCCESS" | "FAILED",
   *   "amount": 100.00,
   *   "currency": "SAR",
   *   "authorizationCode": "123456",
   *   "responseCode": "00",
   *   "timestamp": "2025-12-05T...",
   *   "signature": "HMAC_SHA256_signature"
   * }
   */
  async handleWebhook(payload: any, signature?: string): Promise<WebhookResponse> {
    // In production, verify webhook signature
    const eventType = payload.event || payload.type || 'payment.status';
    const transactionId = payload.transactionReference || payload.transactionId;
    const status = this.mapMadaStatus(payload.status || payload.responseCode);

    return {
      success: status === 'COMPLETED',
      eventType,
      transactionId,
      status,
      amount: payload.amount,
      currency: payload.currency || 'SAR',
      metadata: {
        gateway: 'MADA',
        authorizationCode: payload.authorizationCode,
        responseCode: payload.responseCode,
        cardLast4: payload.cardLast4,
        timestamp: payload.timestamp
      },
      processed: true
    };
  }

  /**
   * Tokenize Mada card
   * Real flow: POST /tokenize
   * Returns PCI-DSS compliant token
   */
  async tokenizeCard(cardData: CardData): Promise<TokenizationResponse> {
    // In production, this would call: POST /tokenize
    // {
    //   "cardNumber": cardData.number,
    //   "expiryMonth": cardData.expiryMonth,
    //   "expiryYear": cardData.expiryYear,
    //   "cvv": cardData.cvv,
    //   "holderName": cardData.holderName
    // }
    // Response:
    // {
    //   "token": "mada_token_...",
    //   "cardLast4": "1234",
    //   "cardBrand": "MADA",
    //   "expiryMonth": 12,
    //   "expiryYear": 2025
    // }

    const cardLast4 = cardData.number.slice(-4);
    const cardBrand = this.detectCardBrand(cardData.number);

    return {
      success: true,
      token: `MADA_TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cardLast4,
      cardBrand,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      message: 'Card tokenized successfully'
    };
  }

  /**
   * Initiate 3D Secure authentication
   * Real flow: POST /3ds/initiate
   */
  async initiate3DSecure(transactionId: string, returnUrl: string): Promise<ThreeDSecureResponse> {
    // In production, this would call: POST /3ds/initiate
    // {
    //   "transactionId": transactionId,
    //   "returnUrl": returnUrl,
    //   "amount": amount,
    //   "currency": "SAR"
    // }
    // Response:
    // {
    //   "acsUrl": "https://acs.mada.com.sa/...",
    //   "pareq": "base64_encoded_pareq",
    //   "md": "merchant_data"
    // }

    return {
      success: true,
      requires3DS: true,
      acsUrl: `https://3ds.mada.com.sa/challenge?transactionId=${transactionId}`,
      pareq: `PARES_${transactionId}_${Date.now()}`,
      md: `MD_${transactionId}`,
      transactionId,
      message: '3D Secure authentication required'
    };
  }

  getConfig(): GatewayConfig {
    return this.config;
  }

  /**
   * Map Mada response code to status
   */
  private mapMadaStatus(responseCode: string): string {
    // Mada response codes:
    // 00 = Success
    // 05 = Declined
    // 14 = Invalid card number
    // 51 = Insufficient funds
    // etc.
    const statusMap: Record<string, string> = {
      '00': 'COMPLETED',
      '05': 'DECLINED',
      '14': 'FAILED',
      '51': 'FAILED',
      '91': 'PENDING'
    };
    return statusMap[responseCode] || 'PENDING';
  }

  /**
   * Detect card brand from card number
   */
  private detectCardBrand(cardNumber: string): string {
    // Mada cards typically start with specific BINs
    if (cardNumber.startsWith('4')) return 'VISA';
    if (cardNumber.startsWith('5')) return 'MASTERCARD';
    if (cardNumber.startsWith('6')) return 'MADA';
    return 'UNKNOWN';
  }
}
