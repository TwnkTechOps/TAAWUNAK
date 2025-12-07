"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect } from "react";
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from "components/Card";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";

function InvoicesPage() {
  const { user, loading } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";

  useEffect(() => {
    if (user) {
      fetch(`${apiBase}/payments/invoices`, {
        credentials: "include"
      })
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => {
          const invoicesData = Array.isArray(data) 
            ? data 
            : (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data))
              ? data.data
              : [];
          setInvoices(invoicesData);
        })
        .catch(err => {
          console.error("Failed to fetch invoices:", err);
          setInvoices([]);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'SENT':
      case 'OVERDUE':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Invoices
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          View and manage your invoices
        </p>
      </div>

      {invoices.length > 0 ? (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <EnterpriseCard key={invoice.id} variant="default" hover>
              <EnterpriseCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(invoice.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {invoice.invoiceNumber}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {invoice.totalAmount} {invoice.currency}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {invoice.status.toLowerCase()}
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
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No invoices found</p>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </main>
  );
}

export default function Invoices() {
  return (
    <ProtectedRoute>
      <InvoicesPage />
    </ProtectedRoute>
  );
}

