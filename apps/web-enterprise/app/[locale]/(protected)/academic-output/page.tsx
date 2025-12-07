"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent, EnterpriseCardHeader, EnterpriseCardTitle } from "components/Card";
import { 
  FileText, 
  Award, 
  Briefcase, 
  Presentation, 
  TrendingUp, 
  Users, 
  Building2, 
  Globe,
  Plus,
  BarChart3,
  Download,
  Upload,
  Search,
  Filter,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "components/Button/Button";

const academicOutputTypes = [
  {
    id: "papers",
    title: "Research Papers",
    description: "Publications, journal articles, conference papers",
    icon: FileText,
    href: "/academic-output/papers",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
    stats: "Publications"
  },
  {
    id: "grants",
    title: "Grants & Funding",
    description: "Research grants, funding received, awards",
    icon: Award,
    href: "/academic-output/grants",
    color: "from-emerald-500 to-teal-500",
    bgColor: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
    stats: "Grants"
  },
  {
    id: "patents",
    title: "Patents",
    description: "Intellectual property, patents, innovations",
    icon: Briefcase,
    href: "/academic-output/patents",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
    stats: "Patents"
  },
  {
    id: "presentations",
    title: "Presentations",
    description: "Conference presentations, seminars, workshops",
    icon: Presentation,
    href: "/academic-output/presentations",
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
    stats: "Presentations"
  }
];

function AcademicOutputHub() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    totalPapers: 0,
    totalGrants: 0,
    totalPatents: 0,
    totalCitations: 0,
    hIndex: 0,
    totalViews: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user) {
      // Fetch statistics
      Promise.all([
        fetch(`${apiBase}/papers?limit=1`, { credentials: "include" }).then(r => r.json()).then(d => ({ count: d.length || 0 })),
        fetch(`${apiBase}/papers`, { credentials: "include" }).then(r => r.json())
      ]).then(([countData, papers]) => {
        const totalPapers = papers.length || 0;
        const totalCitations = papers.reduce((sum: number, p: any) => sum + (p.citationCount || 0), 0);
        const totalViews = papers.reduce((sum: number, p: any) => sum + (p.viewCount || 0), 0);
        
        // Calculate h-index (simplified)
        const citations = papers.map((p: any) => p.citationCount || 0).sort((a: number, b: number) => b - a);
        let hIndex = 0;
        for (let i = 0; i < citations.length; i++) {
          if (citations[i] >= i + 1) {
            hIndex = i + 1;
          } else {
            break;
          }
        }

        setStats({
          totalPapers,
          totalGrants: 0, // TODO: Fetch from grants API
          totalPatents: 0, // TODO: Fetch from patents API
          totalCitations,
          hIndex,
          totalViews
        });

        // Recent activity (last 5 papers)
        setRecentActivity(papers.slice(0, 5).map((p: any) => ({
          id: p.id,
          type: "paper",
          title: p.title,
          date: p.createdAt,
          status: p.status
        })));
      }).catch(err => console.error("Failed to fetch stats:", err));
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Academic Output
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Manage and track all your research outputs, publications, grants, and intellectual property
        </p>
      </div>

      {/* Enhanced Quick Stats with Animations */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <EnterpriseCard variant="gradient" className="text-center hover:scale-105 transition-transform cursor-pointer">
            <EnterpriseCardContent className="py-6">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm w-fit mx-auto mb-3">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalPapers}
              </div>
              <div className="text-sm text-white/90 font-medium">Papers</div>
              <div className="text-xs text-white/70 mt-1">Research Publications</div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <EnterpriseCard variant="gradient" className="text-center hover:scale-105 transition-transform cursor-pointer">
            <EnterpriseCardContent className="py-6">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm w-fit mx-auto mb-3">
                <Award className="h-7 w-7 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalGrants}
              </div>
              <div className="text-sm text-white/90 font-medium">Grants</div>
              <div className="text-xs text-white/70 mt-1">Funding Received</div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <EnterpriseCard variant="gradient" className="text-center hover:scale-105 transition-transform cursor-pointer">
            <EnterpriseCardContent className="py-6">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm w-fit mx-auto mb-3">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalPatents}
              </div>
              <div className="text-sm text-white/90 font-medium">Patents</div>
              <div className="text-xs text-white/70 mt-1">Intellectual Property</div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <EnterpriseCard variant="gradient" className="text-center hover:scale-105 transition-transform cursor-pointer">
            <EnterpriseCardContent className="py-6">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm w-fit mx-auto mb-3">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalCitations}
              </div>
              <div className="text-sm text-white/90 font-medium">Citations</div>
              <div className="text-xs text-white/70 mt-1">Research Impact</div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <EnterpriseCard variant="gradient" className="text-center hover:scale-105 transition-transform cursor-pointer">
            <EnterpriseCardContent className="py-6">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm w-fit mx-auto mb-3">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.hIndex}
              </div>
              <div className="text-sm text-white/90 font-medium">h-index</div>
              <div className="text-xs text-white/70 mt-1">Quality Metric</div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <EnterpriseCard variant="gradient" className="text-center hover:scale-105 transition-transform cursor-pointer">
            <EnterpriseCardContent className="py-6">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm w-fit mx-auto mb-3">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalViews}
              </div>
              <div className="text-sm text-white/90 font-medium">Views</div>
              <div className="text-xs text-white/70 mt-1">Engagement</div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </motion.div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link href="/academic-output/papers/new">
            <EnterpriseCard variant="default" hover glow className="h-full group">
              <EnterpriseCardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 group-hover:scale-110 transition-transform shadow-lg">
                    <Plus className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Add New Output</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Submit paper, grant, or patent</p>
                    <div className="mt-2 text-xs text-brand-600 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center">
                      Get Started <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link href="/academic-output/import">
            <EnterpriseCard variant="default" hover glow className="h-full group">
              <EnterpriseCardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 group-hover:scale-110 transition-transform shadow-lg">
                    <Upload className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Import Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">From ORCID, Scopus, or CSV</p>
                    <div className="mt-2 text-xs text-emerald-600 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center">
                      Import Now <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Link href="/academic-output/analytics">
            <EnterpriseCard variant="default" hover glow className="h-full group">
              <EnterpriseCardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 group-hover:scale-110 transition-transform shadow-lg">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">View Analytics</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Personal, institutional, regional</p>
                    <div className="mt-2 text-xs text-blue-600 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center">
                      Explore <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </Link>
        </motion.div>
      </div>

      {/* Enhanced Academic Output Types */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Research Outputs
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage all your academic achievements
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {academicOutputTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Link href={type.href}>
                  <EnterpriseCard variant="default" hover glow className="h-full group cursor-pointer">
                    <EnterpriseCardContent className="p-6">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-5 shadow-xl group-hover:shadow-2xl transition-all group-hover:scale-110`}>
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 transition-colors">
                        {type.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                        {type.description}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center text-sm text-brand-600 font-semibold group-hover:text-brand-700 transition-colors">
                          View All
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {type.stats}
                        </div>
                      </div>
                    </EnterpriseCardContent>
                  </EnterpriseCard>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Recent Activity */}
      {recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <Link href="/academic-output/papers" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View All →
            </Link>
          </div>
          <EnterpriseCard variant="default" className="overflow-hidden">
            <EnterpriseCardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-brand-500/10 group-hover:bg-brand-500/20 transition-colors">
                        <FileText className="h-5 w-5 text-brand-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/academic-output/papers/${activity.id}`} 
                          className="font-semibold text-gray-900 dark:text-white hover:text-brand-600 transition-colors block truncate"
                        >
                          {activity.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(activity.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.type === 'paper' ? 'Research Paper' : activity.type}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${
                      activity.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                      activity.status === 'UNDER_REVIEW' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {activity.status?.replace('_', ' ')}
                    </span>
                  </motion.div>
                ))}
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </motion.div>
      )}
    </main>
  );
}

export default function AcademicOutput() {
  return (
    <ProtectedRoute>
      <AcademicOutputHub />
    </ProtectedRoute>
  );
}

