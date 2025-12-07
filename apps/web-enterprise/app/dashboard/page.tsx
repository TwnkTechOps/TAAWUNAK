"use client";

import { Card, CardContent, CardHeader, CardTitle } from "components/Card/Card"
import { EnterpriseKpiCard, EnterpriseStatCard, EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from "components/Card"
import { Button } from "components/Button/Button"
import { AreaChartCard } from "components/Chart/AreaChartCard"
import { BarChartCard } from "components/Chart/BarChartCard"
import { ProtectedRoute } from "components/auth/ProtectedRoute"
import { useAuth } from "lib/auth/useAuth"
import { useEffect, useState, useMemo } from "react"
import { Users, Building2, FileText, TrendingUp, Shield, AlertCircle, CheckCircle2, Clock, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"]
const series1 = months.map((m, i) => ({ name: m, value: 20 + Math.round(Math.sin(i / 2) * 10) + i }))
const series2 = months.map((m, i) => ({ name: m, value: 5 + Math.round(Math.cos(i / 2) * 6) + i }))

function DashboardContent() {
  const { user, loading, isAdmin, isInstitutionAdmin, isResearcher } = useAuth();
  const [stats, setStats] = useState<any>({});
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (!user) return;
    
    // Load stats based on role
    if (isAdmin) {
      Promise.all([
        fetch(`${apiBase}/users`, { credentials: "include" })
          .then(r => r.ok ? r.json() : [])
          .then(data => Array.isArray(data) ? data : [])
          .catch(() => []),
        fetch(`${apiBase}/institutions`, { credentials: "include" })
          .then(r => r.ok ? r.json() : [])
          .then(data => Array.isArray(data) ? data : [])
          .catch(() => []),
        fetch(`${apiBase}/credentials/admin/all`, { credentials: "include" })
          .then(r => r.ok ? r.json() : [])
          .then(data => Array.isArray(data) ? data : [])
          .catch(() => []),
      ]).then(([users, institutions, credentials]) => {
        // Ensure all are arrays
        const usersArray = Array.isArray(users) ? users : [];
        const institutionsArray = Array.isArray(institutions) ? institutions : [];
        const credentialsArray = Array.isArray(credentials) ? credentials : [];
        
        setStats({
          totalUsers: usersArray.length || 0,
          totalInstitutions: institutionsArray.length || 0,
          verifiedInstitutions: institutionsArray.filter((i: any) => i?.verified).length || 0,
          pendingCredentials: credentialsArray.filter((c: any) => c?.status === "PENDING").length || 0,
        });
      }).catch((error) => {
        console.error("Failed to load dashboard stats:", error);
        // Set default stats on error
        setStats({
          totalUsers: 0,
          totalInstitutions: 0,
          verifiedInstitutions: 0,
          pendingCredentials: 0,
        });
      });
    } else if (isInstitutionAdmin) {
      // Institution admin stats
      setStats({
        activeProjects: 12,
        teamMembers: 8,
        fundingSecured: "SAR 2.5M",
      });
    } else {
      // Researcher/regular user stats
      setStats({
        activeProjects: 3,
        proposalsSubmitted: 5,
        papersPublished: 2,
        fundingSecured: "SAR 450K",
      });
    }
  }, [user, isAdmin, isInstitutionAdmin, apiBase]);


  const isAdminArea = false; // Dashboard is not in admin area
  
  // Show loading state while user data is being fetched
  if (loading || !user) {
    return (
      <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      {/* Welcome Header with AI-native styling */}
      <div className="flex flex-wrap items-center justify-between gap-3 reveal">
        <div className="space-y-1">
          <h1 className="title-lg tracking-tight ai-gradient-text">
            Welcome back, {user?.fullName || user?.email?.split("@")[0] || "User"}!
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {isAdmin ? "System Administration Dashboard" : 
             isInstitutionAdmin ? "Institution Management Dashboard" :
             "Your Research & Collaboration Hub"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isResearcher && (
            <>
              <Button href="/projects/new">Create project</Button>
              <Button href="/funding" intent="secondary">Browse funding</Button>
            </>
          )}
          {isAdmin && (
            <Button href="/admin/users">Manage Users</Button>
          )}
        </div>
      </div>

      {/* Role-based KPI Row - Enterprise Cards */}
      {isAdmin ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <EnterpriseKpiCard
            label="Total Users"
            value={String(stats.totalUsers || 0)}
            delta="Active users"
            icon={Users}
            trend="up"
            variant="gradient"
            href="/admin/users"
          />
          <EnterpriseKpiCard
            label="Institutions"
            value={`${stats.verifiedInstitutions || 0}/${stats.totalInstitutions || 0}`}
            delta="Verified / Total"
            icon={Building2}
            trend="neutral"
            variant="default"
            href="/admin/institutions"
          />
          <EnterpriseKpiCard
            label="Pending Credentials"
            value={String(stats.pendingCredentials || 0)}
            delta="Awaiting review"
            icon={FileText}
            trend="neutral"
            variant="warning"
            href="/admin/credentials"
          />
          <EnterpriseKpiCard
            label="System Status"
            value="Operational"
            delta="All systems normal"
            icon={CheckCircle2}
            trend="up"
            variant="success"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
        </div>
      ) : isInstitutionAdmin ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <EnterpriseKpiCard
            label="Active Projects"
            value={String(stats.activeProjects || 0)}
            delta="This month"
            icon={TrendingUp}
            trend="up"
            variant="gradient"
          />
          <EnterpriseKpiCard
            label="Team Members"
            value={String(stats.teamMembers || 0)}
            delta="Active"
            icon={Users}
            trend="neutral"
            variant="default"
          />
          <EnterpriseKpiCard
            label="Funding Secured"
            value={stats.fundingSecured || "SAR 0"}
            delta="Total"
            icon={FileText}
            trend="up"
            variant="accent"
          />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <EnterpriseKpiCard
            label="Active Projects"
            value={String(stats.activeProjects || 0)}
            delta="+2 this month"
            icon={TrendingUp}
            trend="up"
            variant="gradient"
          />
          <EnterpriseKpiCard
            label="Funding Secured"
            value={stats.fundingSecured || "SAR 0"}
            delta="+5% this month"
            icon={FileText}
            trend="up"
            variant="accent"
          />
          <EnterpriseKpiCard
            label="Proposals Under Review"
            value={String(stats.proposalsSubmitted || 0)}
            delta="Updated now"
            icon={FileText}
            trend="neutral"
            variant="default"
          />
          <EnterpriseKpiCard
            label="Papers Published"
            value={String(stats.papersPublished || 0)}
            delta="Updated now"
            icon={Sparkles}
            trend="up"
            variant="gradient"
          />
        </div>
      )}

      {/* Charts - only for researchers */}
      {isResearcher && (
        <div className="grid gap-4 lg:grid-cols-2">
          <AreaChartCard title="Projects velocity (last 10 months)" data={series1} />
          <BarChartCard title="Funding obtained per month (SAR M)" data={series2} color="var(--brand-600)" />
        </div>
      )}

      {/* Quick Actions & Recent Activity - Enterprise Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EnterpriseCard variant="glass" hover icon={<Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400" />}>
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>Quick Actions</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {isResearcher && (
                <>
                  <Button href="/projects/new" intent="secondary" size="sm">Create project</Button>
                  <Button href="/funding" intent="secondary" size="sm">Funding calls</Button>
                  <Button href="/proposals/new" intent="secondary" size="sm">Submit proposal</Button>
                  <Button href="/papers/new" intent="secondary" size="sm">Submit paper</Button>
                </>
              )}
              {isAdmin && (
                <>
                  <Button href="/admin/users" intent="secondary" size="sm" className="w-full">Manage Users</Button>
                  <Button href="/admin/institutions" intent="secondary" size="sm" className="w-full">Institutions</Button>
                  <Button href="/admin/credentials" intent="secondary" size="sm" className="w-full">Credentials</Button>
                  <Button href="/admin/compliance" intent="secondary" size="sm" className="w-full">Compliance</Button>
                </>
              )}
              {isInstitutionAdmin && (
                <>
                  <Button href="/admin/institutions" intent="secondary" size="sm">My Institution</Button>
                  <Button href="/projects/new" intent="secondary" size="sm">Create Project</Button>
                </>
              )}
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        
        <EnterpriseCard variant="glass" hover icon={<Clock className="h-5 w-5 text-brand-600 dark:text-brand-400" />}>
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>Recent Activity</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <ul className="space-y-4 text-sm">
              {isAdmin ? (
                <>
                  <li className="flex items-start gap-3">
                    <motion.span 
                      className="mt-0.5 h-2 w-2 rounded-full bg-blue-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div><b className="text-gray-900 dark:text-white">New user registered</b> — <span className="text-gray-600 dark:text-gray-400">{stats.totalUsers || 0} total users</span></div>
                  </li>
                  <li className="flex items-start gap-3">
                    <motion.span 
                      className="mt-0.5 h-2 w-2 rounded-full bg-amber-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    />
                    <div><b className="text-gray-900 dark:text-white">Institution verification pending</b> — <span className="text-gray-600 dark:text-gray-400">{stats.totalInstitutions || 0} institutions</span></div>
                  </li>
                  <li className="flex items-start gap-3">
                    <motion.span 
                      className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    />
                    <div><b className="text-gray-900 dark:text-white">System operational</b> — <span className="text-gray-600 dark:text-gray-400">All services running</span></div>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-3">
                    <motion.span 
                      className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div><b className="text-gray-900 dark:text-white">Proposal approved</b> — <span className="text-gray-600 dark:text-gray-400">AI for Education</span></div>
                  </li>
                  <li className="flex items-start gap-3">
                    <motion.span 
                      className="mt-0.5 h-2 w-2 rounded-full bg-blue-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    />
                    <div><b className="text-gray-900 dark:text-white">Funding call published</b> — <span className="text-gray-600 dark:text-gray-400">National R&D Program</span></div>
                  </li>
                  <li className="flex items-start gap-3">
                    <motion.span 
                      className="mt-0.5 h-2 w-2 rounded-full bg-amber-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    />
                    <div><b className="text-gray-900 dark:text-white">Paper submitted</b> — <span className="text-gray-600 dark:text-gray-400">Federated Learning in K‑12</span></div>
                  </li>
                </>
              )}
            </ul>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>
    </main>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function Kpi({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <Card className="hover-pop glass-strong particle-bg">
      <CardContent className="py-5">
        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">{label}</div>
        <div className="mt-2 text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
          {value}
        </div>
        <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-glow"></span>
          {delta}
        </div>
      </CardContent>
    </Card>
  )
}

function AdminKpi({ label, value, hint, icon, href }: { 
  label: string; 
  value: string; 
  hint?: string;
  icon?: React.ReactNode;
  href?: string;
}) {
  const content = (
    <Card className="hover-pop glass-strong cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] particle-bg">
      <CardContent className="py-5">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">{label}</div>
            <div className="mt-2 text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              {value}
            </div>
            {hint && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-gray-400"></span>
                {hint}
              </div>
            )}
          </div>
          {icon && (
            <div className="text-gray-400 dark:text-gray-500 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
