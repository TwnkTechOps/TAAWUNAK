"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { BarChart3, TrendingUp, Users, Award, Download } from "lucide-react";
import { useRouter } from "next/navigation";

function AnalyticsPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [ministryOverview, setMinistryOverview] = useState<any>(null);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user) {
      if (user.institutionId) {
        fetch(`${apiBase}/participation/analytics?institutionId=${user.institutionId}`, {
          credentials: "include"
        })
          .then(res => res.json())
          .then(data => setAnalytics(data))
          .catch(err => console.error("Failed to fetch analytics:", err));
      }

      if (isAdmin) {
        fetch(`${apiBase}/participation/ministry/overview`, {
          credentials: "include"
        })
          .then(res => res.json())
          .then(data => setMinistryOverview(data))
          .catch(err => console.error("Failed to fetch ministry overview:", err));
      }
    }
  }, [user, apiBase, isAdmin]);

  const handleGenerateReport = async () => {
    try {
      const response = await fetch(`${apiBase}/participation/ministry/reports/inclusive`, {
        credentials: "include"
      });
      if (response.ok) {
        const report = await response.json();
        // Download as JSON
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `participation-report-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert("Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report");
    }
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Participation Analytics
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Engagement metrics and participation insights
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={handleGenerateReport}
              className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
            >
              <Download className="h-5 w-5" />
              Generate Report
            </button>
          )}
        </div>
      </div>

      {/* Institution Analytics */}
      {analytics && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Institution Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <EnterpriseCard variant="gradient" className="text-center">
              <EnterpriseCardContent className="py-4">
                <Users className="h-6 w-6 text-brand-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalParticipants}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Participants</div>
              </EnterpriseCardContent>
            </EnterpriseCard>
            <EnterpriseCard variant="gradient" className="text-center">
              <EnterpriseCardContent className="py-4">
                <Award className="h-6 w-6 text-brand-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalQuotas}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Institutions</div>
              </EnterpriseCardContent>
            </EnterpriseCard>
            <EnterpriseCard variant="gradient" className="text-center">
              <EnterpriseCardContent className="py-4">
                <TrendingUp className="h-6 w-6 text-brand-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.quotaUtilization?.[0]?.utilizationRate?.toFixed(1) || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Utilization</div>
              </EnterpriseCardContent>
            </EnterpriseCard>
            <EnterpriseCard variant="gradient" className="text-center">
              <EnterpriseCardContent className="py-4">
                <BarChart3 className="h-6 w-6 text-brand-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.keys(analytics.tierDistribution || {}).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Tiers</div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </div>

          {/* Gender Distribution */}
          {analytics.genderDistribution && (
            <EnterpriseCard variant="glass" className="mb-6">
              <EnterpriseCardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Gender Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Male</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.genderDistribution.MALE || 0}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-900/30">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Female</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.genderDistribution.FEMALE || 0}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Other</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.genderDistribution.OTHER || 0}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Not Specified</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.genderDistribution.PREFER_NOT_TO_SAY || 0}
                    </div>
                  </div>
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}

          {/* Tier Distribution */}
          {analytics.tierDistribution && Object.keys(analytics.tierDistribution).length > 0 && (
            <EnterpriseCard variant="default">
              <EnterpriseCardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Tier Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.tierDistribution).map(([tier, count]: [string, any]) => (
                    <div key={tier} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {tier.replace(/_/g, ' ')}
                      </span>
                      <span className="text-lg font-bold text-brand-600">
                        {count} participants
                      </span>
                    </div>
                  ))}
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}
        </div>
      )}

      {/* Ministry Overview (Admin Only) */}
      {isAdmin && ministryOverview && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ministry-Level Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <EnterpriseCard variant="gradient" className="text-center">
              <EnterpriseCardContent className="py-4">
                <Users className="h-6 w-6 text-brand-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ministryOverview.summary?.totalInstitutions || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Institutions</div>
              </EnterpriseCardContent>
            </EnterpriseCard>
            <EnterpriseCard variant="gradient" className="text-center">
              <EnterpriseCardContent className="py-4">
                <Award className="h-6 w-6 text-brand-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ministryOverview.summary?.totalQuota || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Quota</div>
              </EnterpriseCardContent>
            </EnterpriseCard>
            <EnterpriseCard variant="gradient" className="text-center">
              <EnterpriseCardContent className="py-4">
                <TrendingUp className="h-6 w-6 text-brand-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ministryOverview.summary?.utilizationRate?.toFixed(1) || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Utilization</div>
              </EnterpriseCardContent>
            </EnterpriseCard>
            <EnterpriseCard variant="gradient" className="text-center">
              <EnterpriseCardContent className="py-4">
                <BarChart3 className="h-6 w-6 text-brand-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ministryOverview.summary?.totalParticipants || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Participants</div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </div>

          {/* Gender Balance Score */}
          {ministryOverview.genderEquality && (
            <EnterpriseCard variant="glass" className="mb-6">
              <EnterpriseCardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Gender Equality Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Male</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {ministryOverview.genderEquality.metrics.male.used} / {ministryOverview.genderEquality.metrics.male.total}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-900/30">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Female</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {ministryOverview.genderEquality.metrics.female.used} / {ministryOverview.genderEquality.metrics.female.total}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Balance Score</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {ministryOverview.genderEquality.balanceScore?.toFixed(1) || 0}/100
                    </div>
                  </div>
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}
        </div>
      )}
    </main>
  );
}

export default function Analytics() {
  return (
    <ProtectedRoute>
      <AnalyticsPage />
    </ProtectedRoute>
  );
}

