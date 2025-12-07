"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect } from "react";
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from "components/Card";
import { CreditCard, Search, Filter, Download } from "lucide-react";

function TransactionsPage() {
  const { user, loading } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";

  useEffect(() => {
    if (user) {
      fetch(`${apiBase}/payments/transactions`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => setTransactions(data || []))
        .catch(err => console.error("Failed to fetch transactions:", err));
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
          Payment Transactions
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          View and manage all your payment transactions
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button className="px-4 py-2 rounded-lg bg-brand-500 text-white">
          All
        </button>
        <button className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          Completed
        </button>
        <button className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          Pending
        </button>
        <button className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          Failed
        </button>
      </div>

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((txn) => (
            <EnterpriseCard key={txn.id} variant="default" hover>
              <EnterpriseCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-brand-500/10">
                      <CreditCard className="h-6 w-6 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {txn.transactionId}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {txn.description || "Payment transaction"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {txn.amount} {txn.currency}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          ))}
        </div>
      ) : (
        <EnterpriseCard variant="glass">
          <EnterpriseCardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions found</p>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </main>
  );
}

export default function Transactions() {
  return (
    <ProtectedRoute>
      <TransactionsPage />
    </ProtectedRoute>
  );
}
