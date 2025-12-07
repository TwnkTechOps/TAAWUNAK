"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect } from "react";
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from "components/Card";
import { RefreshCw, AlertCircle } from "lucide-react";

function RefundsPage() {
  const { user, loading } = useAuth();
  const [refunds, setRefunds] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";

  useEffect(() => {
    if (user) {
      Promise.all([
        fetch(`${apiBase}/payments/refunds`, { credentials: "include" }).then(res => res.ok ? res.json() : []),
        fetch(`${apiBase}/payments/disputes`, { credentials: "include" }).then(res => res.ok ? res.json() : [])
      ])
        .then(([refundsData, disputesData]) => {
          const refundsArray = Array.isArray(refundsData) 
            ? refundsData 
            : (refundsData && typeof refundsData === 'object' && 'data' in refundsData && Array.isArray(refundsData.data))
              ? refundsData.data
              : [];
          const disputesArray = Array.isArray(disputesData) 
            ? disputesData 
            : (disputesData && typeof disputesData === 'object' && 'data' in disputesData && Array.isArray(disputesData.data))
              ? disputesData.data
              : [];
          setRefunds(refundsArray);
          setDisputes(disputesArray);
        })
        .catch(err => {
          console.error("Failed to fetch data:", err);
          setRefunds([]);
          setDisputes([]);
        });
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
          Refunds & Disputes
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Manage refund requests and payment disputes
        </p>
      </div>

      {/* Refunds Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Refunds</h2>
        {refunds.length > 0 ? (
          <div className="space-y-4">
            {refunds.map((refund) => (
              <EnterpriseCard key={refund.id} variant="default" hover>
                <EnterpriseCardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <RefreshCw className="h-5 w-5 text-brand-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {refund.refundId}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {refund.reason} • {new Date(refund.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {refund.amount} {refund.currency}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {refund.status.toLowerCase()}
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
              <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No refunds found</p>
            </EnterpriseCardContent>
          </EnterpriseCard>
        )}
      </div>

      {/* Disputes Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Disputes</h2>
        {disputes.length > 0 ? (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <EnterpriseCard key={dispute.id} variant="default" hover>
                <EnterpriseCardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {dispute.disputeId}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {dispute.type} • {new Date(dispute.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {dispute.status.toLowerCase()}
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
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No disputes found</p>
            </EnterpriseCardContent>
          </EnterpriseCard>
        )}
      </div>
    </main>
  );
}

export default function Refunds() {
  return (
    <ProtectedRoute>
      <RefundsPage />
    </ProtectedRoute>
  );
}

