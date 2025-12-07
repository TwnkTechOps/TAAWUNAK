# Payment Gateway Module - Modular Structure

## Folder Structure

```
apps/api/src/modules/payments/
├── payments.module.ts          # Main module
├── payments.controller.ts       # Main controller
├── services/
│   ├── payment-gateway.service.ts    # Multi-gateway integration
│   ├── wallet.service.ts             # Digital wallet management
│   ├── billing.service.ts             # Billing & invoicing
│   ├── refund.service.ts              # Refund & dispute handling
│   ├── audit.service.ts               # Financial audit logging
│   └── fraud-detection.service.ts     # AI fraud detection
├── gateways/
│   ├── base-gateway.interface.ts      # Gateway interface
│   ├── stc-pay.gateway.ts             # STC Pay integration
│   ├── mada.gateway.ts                # Mada integration
│   ├── paytabs.gateway.ts             # PayTabs integration
│   ├── visa.gateway.ts                # Visa integration
│   └── mastercard.gateway.ts         # Mastercard integration
└── dto/
    ├── create-transaction.dto.ts
    ├── create-wallet.dto.ts
    ├── create-invoice.dto.ts
    └── refund-request.dto.ts

apps/web-enterprise/app/(protected)/payments/
├── page.tsx                    # Main payments hub
├── transactions/
│   └── page.tsx                # Transaction management
├── wallet/
│   └── page.tsx                # Wallet management
├── invoices/
│   └── page.tsx                # Invoice management
├── refunds/
│   └── page.tsx                # Refund & disputes
└── admin/
    └── page.tsx                # Admin dashboard

apps/web-enterprise/components/payments/
├── PaymentHub.tsx              # Main hub component
├── TransactionList.tsx          # Transaction list
├── WalletCard.tsx              # Wallet display
├── InvoiceCard.tsx             # Invoice display
└── PaymentGatewaySelector.tsx  # Gateway selection
```

## Database Models

- PaymentTransaction
- DigitalWallet
- Invoice
- Subscription
- Refund
- Dispute
- PaymentGateway
- TransactionAudit
- FraudAlert

