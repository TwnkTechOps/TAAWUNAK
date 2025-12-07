import { IPaymentGateway, ProcessPaymentData, PaymentResponse, RefundData, RefundResponse, TransactionStatusResponse, GatewayConfig, WebhookResponse, TokenizationResponse, ThreeDSecureResponse, CardData } from './base-gateway.interface';

/**
 * PayTabs Gateway Implementation
 * Optimized to match PayTabs API structure
 * 
 * PayTabs is a full-featured payment gateway in MENA region:
 * - Supports multiple payment methods (cards, wallets, bank transfers)
 * - Hosted payment page and API integration
 * - Webhook-based status updates
 * - Multi-currency support
 * - Recurring payments
 * 
 * Real API endpoints (when implemented):
 * - Sandbox: https://secure.paytabs.com/payment/request
 * - Production: https://secure.paytabs.com/payment/request
 * - API Docs: https://developer.paytabs.com/
 */
export class PayTabsGateway implements IPaymentGateway {
  private config: GatewayConfig = {
    name: 'PAYTABS',
    displayName: 'PayTabs',
    isActive: false,
    isSandbox: true,
    supportedCurrencies: ['SAR', 'USD', 'EUR', 'AED', 'EGP'],
    supportedPaymentMethods: ['CARD', 'MADA', 'STC_PAY', 'APPLE_PAY', 'GOOGLE_PAY', 'BANK_TRANSFER'],
    feePercentage: 2.5, // PayTabs charges 2.5% + fixed fee
    minAmount: 1.0,
    maxAmount: 1000000.0,
    apiEndpoint: process.env.PAYTABS_API_ENDPOINT || 'https://secure.paytabs.com',
    webhookEndpoint: process.env.PAYTABS_WEBHOOK_ENDPOINT,
    supports3DSecure: true,
    supportsTokenization: true,
    supportsRecurring: true,
    requiresRedirect: false // Can use hosted page or direct API
  };

  /**
   * Process PayTabs payment
   * Real flow: Create payment page -> Redirect or return payment page URL
   */
  async processPayment(data: ProcessPaymentData): Promise<PaymentResponse> {
    // In production, this would call: POST /payment/request
    // {
    //   "profile_id": profileId,
    //   "tran_type": "sale",
    //   "tran_class": "ecom",
    //   "cart_id": transactionId,
    //   "cart_currency": data.currency,
    //   "cart_amount": data.amount,
    //   "cart_description": description,
    //   "customer_details": {
    //     "name": data.customerInfo.name,
    //     "email": data.customerInfo.email,
    //     "phone": data.customerInfo.phone,
    //     "street1": data.customerInfo.address?.street,
    //     "city": data.customerInfo.address?.city,
    //     "state": data.customerInfo.address?.state,
    //     "country": data.customerInfo.address?.country,
    //     "zip": data.customerInfo.address?.postalCode
    //   },
    //   "return": data.returnUrl,
    //   "callback": data.webhookUrl
    // }
    // Response:
    // {
    //   "tran_ref": gatewayTransactionId,
    //   "redirect_url": "https://secure.paytabs.com/payment/page/...",
    //   "payment_url": "..."
    // }

    const transactionId = `PT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const gatewayTransactionId = `PT${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // PayTabs returns a hosted payment page URL
    const redirectUrl = data.returnUrl 
      ? `${this.config.apiEndpoint}/payment/page/${gatewayTransactionId}?return=${encodeURIComponent(data.returnUrl)}`
      : `${this.config.apiEndpoint}/payment/page/${gatewayTransactionId}`;

    return {
      success: true,
      transactionId,
      gatewayTransactionId,
      status: 'PENDING',
      message: 'Redirect to PayTabs payment page',
      redirectUrl,
      metadata: {
        gateway: 'PAYTABS',
        sandbox: this.config.isSandbox,
        paymentMethod: data.paymentMethod,
        // Real API would include:
        // paymentUrl: response.data.payment_url,
        // tranRef: response.data.tran_ref,
        // profileId: response.data.profile_id
      }
    };
  }

  /**
   * Refund PayTabs transaction
   * Real flow: POST /payment/refund
   */
  async refundTransaction(refundData: RefundData): Promise<RefundResponse> {
    // In production, this would call: POST /payment/refund
    // {
    //   "profile_id": profileId,
    //   "tran_ref": refundData.originalTransactionId,
    //   "tran_class": "ecom",
    //   "tran_type": "refund",
    //   "cart_amount": refundData.amount,
    //   "cart_currency": "SAR",
    //   "refund_reason": refundData.reason
    // }

    const refundId = `REF-PT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const gatewayRefundId = `PTREF${Date.now()}`;

    return {
      success: true,
      refundId,
      gatewayRefundId,
      status: 'PROCESSING',
      message: 'Refund initiated. Processing may take 5-7 business days.'
    };
  }

  /**
   * Verify PayTabs transaction status
   * Real flow: POST /payment/query
   */
  async verifyTransaction(transactionId: string): Promise<TransactionStatusResponse> {
    // In production, this would call: POST /payment/query
    // {
    //   "profile_id": profileId,
    //   "tran_ref": transactionId
    // }
    // Response:
    // {
    //   "tran_ref": transactionId,
    //   "payment_result": {
    //     "response_status": "A",
    //     "response_code": "G12345",
    //     "response_message": "Authorised",
    //     "transaction_time": "2025-12-05T..."
    //   },
    //   "cart_amount": 100.00,
    //   "cart_currency": "SAR"
    // }

    return {
      transactionId,
      status: 'COMPLETED',
      amount: 0,
      currency: 'SAR',
      gatewayTransactionId: `PT${transactionId}`,
      metadata: {
        gateway: 'PAYTABS',
        sandbox: this.config.isSandbox,
        // Real API would include:
        // responseStatus: response.data.payment_result.response_status,
        // responseCode: response.data.payment_result.response_code,
        // responseMessage: response.data.payment_result.response_message
      }
    };
  }

  /**
   * Handle PayTabs webhook
   * Real webhook payload structure:
   * {
   *   "tran_ref": "...",
   *   "tran_type": "sale" | "refund",
   *   "payment_result": {
   *     "response_status": "A" | "D" | "P",
   *     "response_code": "G12345",
   *     "response_message": "Authorised",
   *     "transaction_time": "2025-12-05T..."
   *   },
   *   "cart_amount": 100.00,
   *   "cart_currency": "SAR",
   *   "customer_details": {...},
   *   "signature": "HMAC_SHA256_signature"
   * }
   */
  async handleWebhook(payload: any, signature?: string): Promise<WebhookResponse> {
    // In production, verify webhook signature
    const transactionId = payload.tran_ref || payload.transactionId;
    const responseStatus = payload.payment_result?.response_status || payload.status;
    const status = this.mapPayTabsStatus(responseStatus);

    return {
      success: status === 'COMPLETED',
      eventType: payload.tran_type || 'payment.status',
      transactionId,
      status,
      amount: payload.cart_amount || payload.amount,
      currency: payload.cart_currency || payload.currency || 'SAR',
      metadata: {
        gateway: 'PAYTABS',
        responseCode: payload.payment_result?.response_code,
        responseMessage: payload.payment_result?.response_message,
        transactionTime: payload.payment_result?.transaction_time,
        customerDetails: payload.customer_details
      },
      processed: true
    };
  }

  /**
   * Tokenize card with PayTabs
   * Real flow: POST /payment/token
   */
  async tokenizeCard(cardData: CardData): Promise<TokenizationResponse> {
    // In production, this would call: POST /payment/token
    // PayTabs returns a token that can be used for future payments
    const cardLast4 = cardData.number.slice(-4);
    const cardBrand = this.detectCardBrand(cardData.number);

    return {
      success: true,
      token: `PT_TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cardLast4,
      cardBrand,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      message: 'Card tokenized successfully'
    };
  }

  /**
   * Initiate 3D Secure with PayTabs
   * PayTabs handles 3DS automatically in hosted payment page
   */
  async initiate3DSecure(transactionId: string, returnUrl: string): Promise<ThreeDSecureResponse> {
    // PayTabs handles 3DS automatically in their hosted payment page
    // For direct API integration, this would call: POST /payment/3ds
    return {
      success: true,
      requires3DS: true,
      redirectUrl: `${this.config.apiEndpoint}/payment/3ds/${transactionId}?return=${encodeURIComponent(returnUrl)}`,
      transactionId,
      message: '3D Secure authentication required'
    };
  }

  getConfig(): GatewayConfig {
    return this.config;
  }

  /**
   * Map PayTabs response status
   * A = Authorised, D = Declined, P = Pending
   */
  private mapPayTabsStatus(responseStatus: string): string {
    const statusMap: Record<string, string> = {
      'A': 'COMPLETED',
      'D': 'DECLINED',
      'P': 'PENDING',
      'F': 'FAILED',
      'C': 'CANCELLED'
    };
    return statusMap[responseStatus?.toUpperCase()] || 'PENDING';
  }

  /**
   * Detect card brand
   */
  private detectCardBrand(cardNumber: string): string {
    if (cardNumber.startsWith('4')) return 'VISA';
    if (cardNumber.startsWith('5')) return 'MASTERCARD';
    if (cardNumber.startsWith('6')) return 'MADA';
    return 'UNKNOWN';
  }
}
