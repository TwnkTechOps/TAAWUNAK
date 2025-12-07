"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from "components/Card";
import { Shield, CheckCircle, XCircle, Globe, CreditCard, Smartphone, Building2, AlertCircle } from "lucide-react";

function GatewaysPage() {
  const { user, loading } = useAuth();
  const [gateways, setGateways] = useState<any[]>([]);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user) {
      fetch(`${apiBase}/payments/gateways`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => setGateways(data || []))
        .catch(err => console.error("Failed to fetch gateways:", err));
    }
  }, [user, apiBase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const gatewayDetails = [
    {
      name: 'STC_PAY',
      displayName: 'STC Pay',
      icon: Smartphone,
      color: 'from-emerald-500 to-teal-500',
      description: 'Mobile wallet payment service in KSA',
      features: ['OAuth 2.0', 'Mobile App', 'QR Code', 'Webhooks'],
      status: gateways.find(g => g.name === 'STC_PAY')?.isActive ? 'Active' : 'Inactive'
    },
    {
      name: 'MADA',
      displayName: 'Mada',
      icon: CreditCard,
      color: 'from-blue-500 to-cyan-500',
      description: 'National debit card network in Saudi Arabia',
      features: ['3D Secure', 'Tokenization', 'Real-time', 'PCI-DSS'],
      status: gateways.find(g => g.name === 'MADA')?.isActive ? 'Active' : 'Inactive'
    },
    {
      name: 'PAYTABS',
      displayName: 'PayTabs',
      icon: Building2,
      color: 'from-purple-500 to-pink-500',
      description: 'Full-featured payment gateway for MENA region',
      features: ['Multi-currency', 'Hosted Page', 'Recurring', 'Webhooks'],
      status: gateways.find(g => g.name === 'PAYTABS')?.isActive ? 'Active' : 'Inactive'
    },
    {
      name: 'VISA',
      displayName: 'Visa',
      icon: CreditCard,
      color: 'from-indigo-500 to-blue-500',
      description: 'Global card network with Visa Direct API',
      features: ['VTS Tokenization', 'Verified by Visa', 'Real-time', 'Multi-currency'],
      status: gateways.find(g => g.name === 'VISA')?.isActive ? 'Active' : 'Inactive'
    },
    {
      name: 'MASTERCARD',
      displayName: 'Mastercard',
      icon: CreditCard,
      color: 'from-red-500 to-orange-500',
      description: 'Global card network with Payment Gateway Services',
      features: ['MDES Tokenization', 'SecureCode', 'Real-time', 'Multi-currency'],
      status: gateways.find(g => g.name === 'MASTERCARD')?.isActive ? 'Active' : 'Inactive'
    }
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Payment Gateways
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Configure and manage payment gateway integrations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gatewayDetails.map((gateway) => {
          const Icon = gateway.icon;
          const gatewayData = gateways.find(g => g.name === gateway.name);
          const isActive = gatewayData?.isActive || false;
          const isSandbox = gatewayData?.isSandbox !== false;

          return (
            <EnterpriseCard key={gateway.name} variant="default" hover>
              <EnterpriseCardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gateway.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {gateway.displayName}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {gateway.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {gateway.features.map((feature) => (
                      <span key={feature} className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Gateway Info */}
                {gatewayData && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Fee:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {gatewayData.feePercentage}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Min Amount:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {gatewayData.minAmount} SAR
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Max Amount:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {gatewayData.maxAmount} SAR
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Environment:</span>
                      <span className={`font-medium ${isSandbox ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {isSandbox ? 'Sandbox' : 'Production'}
                      </span>
                    </div>
                    {gatewayData.supportedCurrencies && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Currencies:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {gatewayData.supportedCurrencies.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Badge */}
                {!gatewayData && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>Gateway not configured</span>
                    </div>
                  </div>
                )}
              </EnterpriseCardContent>
            </EnterpriseCard>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="mt-8">
        <EnterpriseCard variant="glass" className="border-2 border-brand-500/30">
          <EnterpriseCardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-brand-500/10">
                <Shield className="h-6 w-6 text-brand-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Gateway Integration Status
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  All payment gateways are optimized with real API structures. When ready for production:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Get API credentials from each gateway provider</li>
                  <li>Replace placeholder methods with real HTTP requests</li>
                  <li>Configure webhook endpoints</li>
                  <li>Test in sandbox environment</li>
                  <li>Switch to production when ready</li>
                </ul>
              </div>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>
    </main>
  );
}

export default function Gateways() {
  return (
    <ProtectedRoute>
      <GatewaysPage />
    </ProtectedRoute>
  );
}

