"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect } from "react";
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from "components/Card";
import { Button } from "components/Button/Button";
import { Wallet, Plus, ArrowRight } from "lucide-react";

function WalletPage() {
  const { user, loading } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";

  useEffect(() => {
    if (user) {
      fetch(`${apiBase}/payments/wallet`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => setWallet(data))
        .catch(err => console.error("Failed to fetch wallet:", err));
    }
  }, [user, apiBase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Digital Wallet
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Manage your wallet balance and transactions
        </p>
      </div>

      {/* Wallet Balance Card */}
      <EnterpriseCard variant="gradient" className="mb-8">
        <EnterpriseCardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Wallet Balance</p>
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {wallet?.balance?.toFixed(2) || "0.00"} {wallet?.currency || "SAR"}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {wallet?.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/20 backdrop-blur-sm">
              <Wallet className="h-12 w-12 text-white" />
            </div>
          </div>
        </EnterpriseCardContent>
      </EnterpriseCard>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Button
          href="/payments/wallet/top-up"
          size="lg"
          className="w-full"
        >
          <Plus className="mr-2 h-5 w-5" />
          Top Up Wallet
        </Button>
        <Button
          href="/payments/wallet/transactions"
          size="lg"
          intent="secondary"
          className="w-full"
        >
          View Transactions
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Info Card */}
      <EnterpriseCard variant="glass">
        <EnterpriseCardContent className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            About Digital Wallet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your digital wallet allows you to store funds securely and make quick payments.
            All transactions are encrypted and compliant with KSA regulations.
          </p>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </main>
  );
}

export default function Wallet() {
  return (
    <ProtectedRoute>
      <WalletPage />
    </ProtectedRoute>
  );
}
