"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Globe, TrendingUp, Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";

function RegionalAnalyticsPage() {
  const { user, loading } = useAuth();

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
        <Link href="/academic-output/analytics" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Analytics
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Regional Research Indicators
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Regional and national research performance analysis
        </p>
      </div>

      <EnterpriseCard variant="default">
        <EnterpriseCardContent className="p-6">
          <div className="text-center py-12">
            <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Regional Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Regional-level research indicators and comparisons will be available here.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              This includes regional publication trends, citation impact by region,
              collaboration patterns, and national research standing metrics.
            </p>
          </div>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </main>
  );
}

export default function RegionalAnalytics() {
  return (
    <ProtectedRoute>
      <RegionalAnalyticsPage />
    </ProtectedRoute>
  );
}

