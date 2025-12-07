import { IPaymentGateway, ProcessPaymentData, PaymentResponse, RefundData, RefundResponse, TransactionStatusResponse, GatewayConfig, WebhookResponse, TokenizationResponse, ThreeDSecureResponse, CardData } from './base-gateway.interface';

/**
 * Mastercard Gateway Implementation
 * Optimized to match Mastercard Payment Gateway Services API structure
 * 
 * Mastercard Payment Gateway Services provides:
 * - Tokenization (MDES - Mastercard Digital Enablement Service)
 * - 3D Secure (Mastercard SecureCode)
 * - Real-time payments
 * - Multi-currency support
 * - Recurring payments
 * 
 * Real API endpoints (when implemented):
 * - Sandbox: https://sandbox.api.mastercard.com/
 * - Production: https://api.mastercard.com/
 * - Gateway: https://ap.gateway.mastercard.com/
 */
export class MastercardGateway implements IPaymentGateway {
  private config: GatewayConfig = {
    name: 'MASTERCARD',
    displayName: 'Mastercard',
    isActive: false,
    isSandbox: true,
    supportedCurrencies: ['SAR', 'USD', 'EUR', 'GBP', 'AED'],
    supportedPaymentMethods: ['CARD', 'MASTERCARD_DIRECT', 'MASTERCARD_CHECKOUT'],
    feePercentage: 2.0, // Mastercard interchange + processing fees
    minAmount: 1.0,
    maxAmount: 500000.0,
    apiEndpoint: process.env.MASTERCARD_API_ENDPOINT || 'https://sandbox.api.mastercard.com',
    webhookEndpoint: process.env.MASTERCARD_WEBHOOK_ENDPOINT,
    supports3DSecure: true, // Mastercard SecureCode
    supportsTokenization: true, // MDES
    supportsRecurring: true,
    requiresRedirect: true // For 3DS
  };

  /**
   * Process Mastercard payment
   * Real flow: Tokenize -> Authorize -> 3DS if needed -> Capture
   */
  async processPayment(data: ProcessPaymentData): Promise<PaymentResponse> {
    // In production, this would use Mastercard Payment Gateway API:
    // POST /api/rest/version/XX/merchant/{merchantId}/order/{orderId}/transaction/{transactionId}
    // {
    //   "apiOperation": "PAY",
    //   "order": {
    //     "amount": data.amount,
    //     "currency": data.currency
    //   },
    //   "sourceOfFunds": {
    //     "type": "CARD",
    //     "provided": {
    //       "card": {
    //         "number": cardData.number,
    //         "expiry": {
    //           "month": cardData.expiryMonth,
    //           "year": cardData.expiryYear
    //         },
    //         "securityCode": cardData.cvv
    //       }
    //     },
    //     "token": data.cardData?.token
    //   },
    //   "authentication": {
    //     "3ds": {
    //       "authenticationRedirect": {
    //         "responseUrl": data.returnUrl
    //       }
    //     }
    //   }
    // }

    const transactionId = `MC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const gatewayTransactionId = `MC${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // Mastercard typically requires 3DS for e-commerce
    const requires3DS = !data.cardData?.token || data.amount > 50;

    if (requires3DS) {
      return {
        success: true,
        transactionId,
        gatewayTransactionId,
        status: 'PENDING_3DS',
        message: 'Mastercard SecureCode authentication required',
        redirectUrl: data.returnUrl 
          ? `${data.returnUrl}?transactionId=${transactionId}&gateway=MASTERCARD&requires3DS=true`
          : `https://secure.mastercard.com/3ds/challenge?transactionId=${gatewayTransactionId}`,
        metadata: {
          gateway: 'MASTERCARD',
          sandbox: this.config.isSandbox,
          requires3DS: true,
          // Real API would include:
          // acsUrl: response.data.authentication.3ds.acsUrl,
          // pareq: response.data.authentication.3ds.pareq,
          // md: response.data.authentication.3ds.md
        }
      };
    }

    return {
      success: true,
      transactionId,
      gatewayTransactionId,
      status: 'PROCESSING',
      message: 'Payment processing',
      metadata: {
        gateway: 'MASTERCARD',
        sandbox: this.config.isSandbox,
        // Real API would include:
        // authorizationCode: response.data.authorizationCode,
        // responseCode: response.data.response.gatewayCode,
        // transactionId: response.data.transaction.id
      }
    };
  }

  /**
   * Refund Mastercard transaction
   * Real flow: POST /api/rest/version/XX/merchant/{merchantId}/order/{orderId}/transaction/{transactionId}
   */
  async refundTransaction(refundData: RefundData): Promise<RefundResponse> {
    // In production, this would call Mastercard Refund API
    // {
    //   "apiOperation": "REFUND",
    //   "transaction": {
    //     "targetTransactionId": refundData.originalTransactionId
    //   },
    //   "order": {
    //     "amount": refundData.amount,
    //     "currency": "SAR"
    //   }
    // }

    const refundId = `REF-MC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const gatewayRefundId = `MCREF${Date.now()}`;

    return {
      success: true,
      refundId,
      gatewayRefundId,
      status: 'PROCESSING',
      message: 'Refund initiated. Processing may take 3-5 business days.'
    };
  }

  /**
   * Verify Mastercard transaction
   * Real flow: GET /api/rest/version/XX/merchant/{merchantId}/order/{orderId}/transaction/{transactionId}
   */
  async verifyTransaction(transactionId: string): Promise<TransactionStatusResponse> {
    // In production, this would query Mastercard transaction status
    return {
      transactionId,
      status: 'COMPLETED',
      amount: 0,
      currency: 'SAR',
      gatewayTransactionId: `MC${transactionId}`,
      metadata: {
        gateway: 'MASTERCARD',
        sandbox: this.config.isSandbox
      }
    };
  }

  /**
   * Handle Mastercard webhook
   */
  async handleWebhook(payload: any, signature?: string): Promise<WebhookResponse> {
    const transactionId = payload.transactionId || payload.order?.id;
    const status = this.mapMastercardStatus(payload.status || payload.response?.gatewayCode);

    return {
      success: status === 'COMPLETED',
      eventType: payload.eventType || payload.apiOperation || 'payment.status',
      transactionId,
      status,
      amount: payload.order?.amount || payload.amount,
      currency: payload.order?.currency || payload.currency || 'SAR',
      metadata: {
        gateway: 'MASTERCARD',
        authorizationCode: payload.authorizationCode,
        gatewayCode: payload.response?.gatewayCode,
        transactionId: payload.transaction?.id
      },
      processed: true
    };
  }

  /**
   * Tokenize card using MDES (Mastercard Digital Enablement Service)
   * Real flow: POST /mdes/csapi/v2/token/create
   */
  async tokenizeCard(cardData: CardData): Promise<TokenizationResponse> {
    // In production, this would call MDES Token Create API
    // {
    //   "primaryAccountNumber": cardData.number,
    //   "expirationMonth": cardData.expiryMonth,
    //   "expirationYear": cardData.expiryYear,
    //   "cardholderName": cardData.holderName
    // }
    // Response:
    // {
    //   "token": "mastercard_token_...",
    //   "tokenLast4": "1234",
    //   "tokenExpirationMonth": 12,
    //   "tokenExpirationYear": 2025
    // }

    const cardLast4 = cardData.number.slice(-4);

    return {
      success: true,
      token: `MC_TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cardLast4,
      cardBrand: 'MASTERCARD',
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      message: 'Card tokenized successfully using MDES'
    };
  }

  /**
   * Initiate Mastercard SecureCode (3DS)
   * Real flow: POST /api/rest/version/XX/merchant/{merchantId}/3DSecureIdLookup
   */
  async initiate3DSecure(transactionId: string, returnUrl: string): Promise<ThreeDSecureResponse> {
    // In production, this would call Mastercard 3DS API
    return {
      success: true,
      requires3DS: true,
      acsUrl: `https://secure.mastercard.com/3ds/challenge?transactionId=${transactionId}`,
      pareq: `PARES_${transactionId}_${Date.now()}`,
      md: `MD_${transactionId}`,
      transactionId,
      message: 'Mastercard SecureCode authentication required'
    };
  }

  getConfig(): GatewayConfig {
    return this.config;
  }

  /**
   * Map Mastercard status codes
   */
  private mapMastercardStatus(gatewayCode: string): string {
    // Mastercard gateway codes:
    // APPROVED = Success
    // DECLINED = Declined
    // ERROR = Error
    const statusMap: Record<string, string> = {
      'APPROVED': 'COMPLETED',
      'DECLINED': 'DECLINED',
      'ERROR': 'FAILED',
      'PENDING': 'PENDING',
      'CANCELLED': 'CANCELLED'
    };
    return statusMap[gatewayCode?.toUpperCase()] || 'PENDING';
  }
}
