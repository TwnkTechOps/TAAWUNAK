"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from "components/Card";
import { Shield, TrendingUp, AlertTriangle, FileText } from "lucide-react";

function AdminPage() {
  const { user, isAdmin, isInstitutionAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!isAdmin && !isInstitutionAdmin) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-8">
        <EnterpriseCard variant="glass">
          <EnterpriseCardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Access denied. Admin privileges required.</p>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Payment Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Financial oversight, compliance monitoring, and fraud detection
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <TrendingUp className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">0.00</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue (SAR)</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <FileText className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">00</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <AlertTriangle className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">00</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Fraud Alerts</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <Shield className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">00</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Gateways</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      {/* Compliance Notice */}
      <EnterpriseCard variant="glass" className="border-2 border-emerald-500/30">
        <EnterpriseCardContent className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Compliance & Security Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">PCI-DSS</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Compliant</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">SAMA</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Ready</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">PDPL</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Compliant</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">ISO 27001</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Compliant</div>
            </div>
          </div>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </main>
  );
}

export default function Admin() {
  return (
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  );
}

