"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { PaymentHub } from "components/payments/PaymentHub";

export default function PaymentsPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-7xl px-5 py-8">
        <PaymentHub />
      </main>
    </ProtectedRoute>
  );
}

