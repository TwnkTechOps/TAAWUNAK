"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseKpiCard } from "components/Card";
import { BarChart3, TrendingUp, Award, CheckCircle, XCircle, Clock, Building2, Globe, Users, Target } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

function DecisionMakerDashboardPage() {
  const { user, loading, isAdmin } = useAuth();
  const [tierStats, setTierStats] = useState<any>(null);
  const [approvalStats, setApprovalStats] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user && isAdmin) {
      Promise.all([
        fetch(`${apiBase}/proposals/tiers/stats`, { credentials: "include" })
          .then(r => r.ok ? r.json() : null)
          .catch(() => null),
        fetch(`${apiBase}/proposals/approvals/stats`, { credentials: "include" })
          .then(r => r.ok ? r.json() : null)
          .catch(() => null),
        fetch(`${apiBase}/proposals`, { credentials: "include" })
          .then(r => r.ok ? r.json() : [])
          .catch(() => [])
      ]).then(([tierData, approvalData, proposalsData]) => {
        setTierStats(tierData || { tier1: 0, tier2: 0, tier3: 0, tier4: 0, total: 0 });
        setApprovalStats(approvalData || { approved: 0, pending: 0, rejected: 0, revisionRequested: 0, approvalRate: "0.0", rejectionRate: "0.0" });
        setProposals(Array.isArray(proposalsData) ? proposalsData : []);
      }).catch(err => {
        console.error("Failed to fetch data:", err);
        // Set default values on error
        setTierStats({ tier1: 0, tier2: 0, tier3: 0, tier4: 0, total: 0 });
        setApprovalStats({ approved: 0, pending: 0, rejected: 0, revisionRequested: 0, approvalRate: "0.0", rejectionRate: "0.0" });
        setProposals([]);
      });
    }
  }, [user, isAdmin, apiBase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-8">
        <EnterpriseCard variant="glass">
          <EnterpriseCardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Access denied. Admin privileges required.</p>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </main>
    );
  }

  // Prepare chart data
  const tierDistributionData = tierStats ? [
    { name: "Tier 1", value: tierStats.tier1 || 0, color: "#10b981" },
    { name: "Tier 2", value: tierStats.tier2 || 0, color: "#3b82f6" },
    { name: "Tier 3", value: tierStats.tier3 || 0, color: "#f97316" },
    { name: "Tier 4", value: tierStats.tier4 || 0, color: "#6b7280" }
  ] : [];

  const approvalStatusData = approvalStats ? [
    { name: "Approved", value: approvalStats.approved || 0, color: "#10b981" },
    { name: "Pending", value: approvalStats.pending || 0, color: "#f59e0b" },
    { name: "Rejected", value: approvalStats.rejected || 0, color: "#ef4444" },
    { name: "Revision", value: approvalStats.revisionRequested || 0, color: "#6366f1" }
  ] : [];

  // Calculate conversion rate
  const convertedProposals = proposals.filter(p => p.conversionStatus === "CONVERTED").length;
  const conversionRate = proposals.length > 0 ? ((convertedProposals / proposals.length) * 100).toFixed(1) : "0.0";

  // Regional/Institutional distribution
  const institutionalDistribution = proposals.reduce((acc: any, p: any) => {
    const instName = p.project?.institution?.name || "Unknown";
    acc[instName] = (acc[instName] || 0) + 1;
    return acc;
  }, {});

  const institutionalData = Object.entries(institutionalDistribution)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          National Decision Maker Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Comprehensive insights into proposal distribution, evaluation outcomes, and national R&D performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <EnterpriseKpiCard
          label="Total Proposals"
          value={tierStats?.total || 0}
          icon={BarChart3}
          variant="accent"
        />
        <EnterpriseKpiCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          trend={{ value: `${convertedProposals} converted`, isPositive: parseFloat(conversionRate) > 10 }}
          icon={TrendingUp}
          variant="default"
        />
        <EnterpriseKpiCard
          label="Approval Rate"
          value={approvalStats ? `${approvalStats.approvalRate || "0.0"}%` : "0%"}
          icon={CheckCircle}
          variant="default"
        />
        <EnterpriseKpiCard
          label="Active Institutions"
          value={Object.keys(institutionalDistribution).length}
          icon={Building2}
          variant="default"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tier Distribution */}
        <EnterpriseCard variant="default">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>Proposal Distribution by Tier</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {tierDistributionData.length > 0 && tierDistributionData.some(d => d.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tierDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tierDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {tierDistributionData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tier distribution data available</p>
                </div>
              </div>
            )}
            {/* Always show legend */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                { name: "Tier 1", color: "#10b981" },
                { name: "Tier 2", color: "#3b82f6" },
                { name: "Tier 3", color: "#f97316" },
                { name: "Tier 4", color: "#6b7280" }
              ].map((item, index) => {
                const dataItem = tierDistributionData.find(d => d.name === item.name);
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white ml-auto">
                      {dataItem?.value || 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>

        {/* Approval Status */}
        <EnterpriseCard variant="default">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>Approval Status Distribution</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {approvalStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={approvalStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6">
                    {approvalStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No approval status data available</p>
                </div>
              </div>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Institutional Distribution */}
        <EnterpriseCard variant="default">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>Top Institutions by Proposal Count</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {institutionalData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={institutionalData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No institutional data available</p>
                </div>
              </div>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>

        {/* Tier Statistics */}
        <EnterpriseCard variant="default">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>Tier Statistics</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <div className="space-y-4">
              {tierStats && (
                <>
                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-emerald-900 dark:text-emerald-100">Tier 1 (Ready)</span>
                      <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                        {tierStats.tier1 || 0}
                      </span>
                    </div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300">
                      {tierStats.tier1Percentage || "0.0"}% of total
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-blue-900 dark:text-blue-100">Tier 2 (Good Potential)</span>
                      <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {tierStats.tier2 || 0}
                      </span>
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      {tierStats.tier2Percentage || "0.0"}% of total
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-orange-900 dark:text-orange-100">Tier 3 (Early Stage)</span>
                      <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                        {tierStats.tier3 || 0}
                      </span>
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">
                      {tierStats.tier3Percentage || "0.0"}% of total
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">Tier 4 (Needs Development)</span>
                      <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                        {tierStats.tier4 || 0}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {tierStats.tier4Percentage || "0.0"}% of total
                    </div>
                  </div>
                </>
              )}
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      {/* Approval Statistics */}
      {approvalStats && (
        <EnterpriseCard variant="default">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>Approval Workflow Statistics</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center">
                <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                  {approvalStats.approved || 0}
                </div>
                <div className="text-sm text-emerald-600 dark:text-emerald-400">Approved</div>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center">
                <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mb-1">
                  {approvalStats.pending || 0}
                </div>
                <div className="text-sm text-amber-600 dark:text-amber-400">Pending</div>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-700 dark:text-red-300 mb-1">
                  {approvalStats.rejected || 0}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Rejected</div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-1">
                  {approvalStats.revisionRequested || 0}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Revision Requested</div>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Approval Rate</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {approvalStats.approvalRate || "0.0"}%
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rejection Rate</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {approvalStats.rejectionRate || "0.0"}%
                </span>
              </div>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </main>
  );
}

export default function DecisionMakerDashboard() {
  return (
    <ProtectedRoute>
      <DecisionMakerDashboardPage />
    </ProtectedRoute>
  );
}

