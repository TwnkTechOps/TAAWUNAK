"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Building2, Users, TrendingUp, FileText, ArrowLeft, Globe, Award } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

function InstitutionalAnalyticsPage() {
  const { user, loading } = useAuth();
  const [papers, setPapers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPapers: 0,
    totalCitations: 0,
    totalResearchers: 0,
    avgCitationsPerPaper: 0
  });
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user && (user as any).institutionId) {
      const institutionId = (user as any).institutionId;
      fetch(`${apiBase}/papers`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          const institutionPapers = Array.isArray(data) ? data.filter((p: any) => p.institutionId === institutionId) : [];
          setPapers(institutionPapers);
          
          const totalCitations = institutionPapers.reduce((sum: number, p: any) => sum + (p.citationCount || 0), 0);
          const uniqueResearchers = new Set(institutionPapers.map((p: any) => p.createdById)).size;
          
          setStats({
            totalPapers: institutionPapers.length,
            totalCitations,
            totalResearchers: uniqueResearchers,
            avgCitationsPerPaper: institutionPapers.length > 0 ? totalCitations / institutionPapers.length : 0
          });
        })
        .catch(err => console.error("Failed to fetch papers:", err));
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
        <Link href="/academic-output/analytics" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Analytics
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Institutional Research Indicators
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {(user as any)?.institution?.name || "Your Institution"} research performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <FileText className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalPapers}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Papers</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <TrendingUp className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalCitations}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Citations</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <Users className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalResearchers}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Researchers</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <Building2 className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.avgCitationsPerPaper.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg Citations</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      {/* Research Areas Distribution */}
      {papers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <EnterpriseCard variant="default">
            <EnterpriseCardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Research Areas
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(() => {
                        const areaCounts: Record<string, number> = {};
                        papers.forEach(p => {
                          (p.domainTags || []).forEach((tag: string) => {
                            areaCounts[tag] = (areaCounts[tag] || 0) + 1;
                          });
                        });
                        return Object.entries(areaCounts)
                          .map(([name, value]) => ({ name, value }))
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 5);
                      })()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                       label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard variant="default">
            <EnterpriseCardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Publication Status
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(() => {
                    const statusCounts: Record<string, number> = {};
                    papers.forEach(p => {
                      const status = p.status || 'DRAFT';
                      statusCounts[status] = (statusCounts[status] || 0) + 1;
                    });
                    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#10b981"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </div>
      )}

      {/* Institution Overview */}
      <EnterpriseCard variant="default">
        <EnterpriseCardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Institution Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-gray-900 dark:text-white">Research Impact</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.totalCitations > 0 
                  ? `Average of ${(stats.totalCitations / stats.totalPapers).toFixed(1)} citations per paper`
                  : 'No citations yet'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <div className="flex items-center gap-3 mb-2">
                <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-gray-900 dark:text-white">Productivity</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.totalPapers} papers from {stats.totalResearchers} researchers
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold text-gray-900 dark:text-white">Growth</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active research institution with growing output
              </p>
            </div>
          </div>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </main>
  );
}

export default function InstitutionalAnalytics() {
  return (
    <ProtectedRoute>
      <InstitutionalAnalyticsPage />
    </ProtectedRoute>
  );
}

