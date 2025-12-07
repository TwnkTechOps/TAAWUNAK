/**
 * Base interface for payment gateway implementations
 * All payment gateways must implement this interface
 * Optimized to match real-world payment gateway APIs
 */
export interface IPaymentGateway {
  /**
   * Process a payment transaction
   * Returns redirect URL for 3DS or direct payment response
   */
  processPayment(data: ProcessPaymentData): Promise<PaymentResponse>;

  /**
   * Refund a transaction (full or partial)
   */
  refundTransaction(refundData: RefundData): Promise<RefundResponse>;

  /**
   * Verify a transaction status
   */
  verifyTransaction(transactionId: string): Promise<TransactionStatusResponse>;

  /**
   * Handle webhook callback from gateway
   */
  handleWebhook(payload: any, signature?: string): Promise<WebhookResponse>;

  /**
   * Tokenize card data (PCI-DSS compliant)
   */
  tokenizeCard(cardData: CardData): Promise<TokenizationResponse>;

  /**
   * Initiate 3D Secure authentication
   */
  initiate3DSecure(transactionId: string, returnUrl: string): Promise<ThreeDSecureResponse>;

  /**
   * Get gateway configuration
   */
  getConfig(): GatewayConfig;
}

export interface ProcessPaymentData {
  amount: number;
  currency: string;
  paymentMethod: string;
  cardData?: TokenizedCardData;
  customerInfo: CustomerInfo;
  metadata?: Record<string, any>;
  returnUrl?: string;
  webhookUrl?: string;
}

export interface TokenizedCardData {
  token: string; // PCI-DSS compliant token
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface CustomerInfo {
  userId: string;
  email: string;
  name: string;
  phone?: string;
  address?: Address;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  gatewayTransactionId?: string;
  status: string;
  message?: string;
  redirectUrl?: string;
  metadata?: Record<string, any>;
}

export interface RefundData {
  originalTransactionId: string;
  amount: number;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface RefundResponse {
  success: boolean;
  refundId: string;
  gatewayRefundId?: string;
  status: string;
  message?: string;
}

export interface TransactionStatusResponse {
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  gatewayTransactionId?: string;
  metadata?: Record<string, any>;
}

export interface GatewayConfig {
  name: string;
  displayName: string;
  isActive: boolean;
  isSandbox: boolean;
  supportedCurrencies: string[];
  supportedPaymentMethods: string[];
  feePercentage: number;
  minAmount?: number;
  maxAmount?: number;
  apiEndpoint?: string;
  webhookEndpoint?: string;
  supports3DSecure?: boolean;
  supportsTokenization?: boolean;
  supportsRecurring?: boolean;
  requiresRedirect?: boolean;
}

export interface CardData {
  number: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  holderName: string;
}

export interface TokenizationResponse {
  success: boolean;
  token: string;
  cardLast4: string;
  cardBrand: string;
  expiryMonth?: number;
  expiryYear?: number;
  message?: string;
}

export interface ThreeDSecureResponse {
  success: boolean;
  requires3DS: boolean;
  redirectUrl?: string;
  acsUrl?: string;
  pareq?: string;
  md?: string;
  transactionId: string;
  message?: string;
}

export interface WebhookResponse {
  success: boolean;
  eventType: string;
  transactionId: string;
  status: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, any>;
  processed: boolean;
}

