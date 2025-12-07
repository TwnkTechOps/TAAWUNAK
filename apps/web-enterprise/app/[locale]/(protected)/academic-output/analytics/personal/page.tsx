"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { TrendingUp, FileText, Users, Award, BarChart3, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

function PersonalAnalyticsPage() {
  const { user, loading } = useAuth();
  const [papers, setPapers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPapers: 0,
    totalCitations: 0,
    hIndex: 0,
    i10Index: 0,
    avgCitationsPerPaper: 0,
    totalViews: 0
  });
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user) {
      fetch(`${apiBase}/papers`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          const userPapers = data.filter((p: any) => p.createdById === user.id);
          setPapers(userPapers);
          
          const totalCitations = userPapers.reduce((sum: number, p: any) => sum + (p.citationCount || 0), 0);
          const totalViews = userPapers.reduce((sum: number, p: any) => sum + (p.viewCount || 0), 0);
          
          // Calculate h-index
          const citations = userPapers.map((p: any) => p.citationCount || 0).sort((a: number, b: number) => b - a);
          let hIndex = 0;
          for (let i = 0; i < citations.length; i++) {
            if (citations[i] >= i + 1) {
              hIndex = i + 1;
            } else {
              break;
            }
          }
          
          // Calculate i10-index (papers with at least 10 citations)
          const i10Index = citations.filter(c => c >= 10).length;
          
          setStats({
            totalPapers: userPapers.length,
            totalCitations,
            hIndex,
            i10Index,
            avgCitationsPerPaper: userPapers.length > 0 ? totalCitations / userPapers.length : 0,
            totalViews
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

  // Publication trend (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i).reverse();
  const publicationsByYear = years.map(year => ({
    year,
    count: papers.filter(p => {
      const pubDate = p.publicationDate ? new Date(p.publicationDate) : new Date(p.createdAt);
      return pubDate.getFullYear() === year;
    }).length
  }));

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/academic-output/analytics" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Analytics
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Personal Research Indicators
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your individual research performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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
            <BarChart3 className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.hIndex}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">h-index</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <Award className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.i10Index}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">i10-index</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <TrendingUp className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.avgCitationsPerPaper.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg Citations</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <Users className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalViews}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Views</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      {/* Enhanced Publication Trend with Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <EnterpriseCard variant="default">
          <EnterpriseCardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Publication Trend
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last 5 Years
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={publicationsByYear}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis 
                    dataKey="year" 
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
                    dataKey="count" 
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard variant="default">
          <EnterpriseCardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Citation Trend
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last 5 Years
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={publicationsByYear.map(item => ({
                  year: item.year,
                  citations: papers
                    .filter(p => {
                      const pubDate = p.publicationDate ? new Date(p.publicationDate) : new Date(p.createdAt);
                      return pubDate.getFullYear() === item.year;
                    })
                    .reduce((sum, p) => sum + (p.citationCount || 0), 0)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis 
                    dataKey="year" 
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
                  <Line 
                    type="monotone" 
                    dataKey="citations" 
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      {/* Enhanced Top Papers */}
      {papers.length > 0 && (
        <EnterpriseCard variant="default">
          <EnterpriseCardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Top Cited Papers
            </h3>
            <div className="space-y-3">
              {papers
                .sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0))
                .slice(0, 5)
                .map((paper, index) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-brand-50 hover:to-brand-100 dark:hover:from-brand-900/20 dark:hover:to-brand-800/20 transition-all group border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                        index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/academic-output/papers/${paper.id}`} 
                          className="font-semibold text-gray-900 dark:text-white hover:text-brand-600 transition-colors block truncate"
                        >
                          {paper.title}
                        </Link>
                        {paper.publicationDate && (
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(paper.publicationDate).getFullYear()}
                            </p>
                            {paper.journal && (
                              <>
                                <span className="text-gray-400">•</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                  {paper.journal}
                                </p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="flex items-baseline gap-1">
                        <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                          {paper.citationCount || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">citations</div>
                      </div>
                      {paper.viewCount > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {paper.viewCount} views
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </main>
  );
}

export default function PersonalAnalytics() {
  return (
    <ProtectedRoute>
      <PersonalAnalyticsPage />
    </ProtectedRoute>
  );
}

