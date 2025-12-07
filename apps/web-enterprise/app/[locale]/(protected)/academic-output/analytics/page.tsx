"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import Link from "next/link";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { BarChart3, Users, Building2, Globe, TrendingUp, ArrowRight } from "lucide-react";

const analyticsLevels = [
  {
    id: "personal",
    title: "Personal Indicators",
    description: "Your individual research performance metrics",
    icon: Users,
    href: "/academic-output/analytics/personal",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "institutional",
    title: "Institutional Indicators",
    description: "Department and institution-level research metrics",
    icon: Building2,
    href: "/academic-output/analytics/institutional",
    color: "from-emerald-500 to-teal-500"
  },
  {
    id: "regional",
    title: "Regional Indicators",
    description: "Regional and national research performance analysis",
    icon: Globe,
    href: "/academic-output/analytics/regional",
    color: "from-purple-500 to-pink-500"
  }
];

function AnalyticsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Research Analytics
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Comprehensive research performance indicators at multiple levels
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {analyticsLevels.map((level) => {
          const Icon = level.icon;
          return (
            <Link key={level.id} href={level.href}>
              <EnterpriseCard variant="default" hover glow className="h-full">
                <EnterpriseCardContent className="p-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {level.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {level.description}
                  </p>
                  <div className="flex items-center text-sm text-brand-600 font-medium">
                    View Analytics <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </EnterpriseCardContent>
              </EnterpriseCard>
            </Link>
          );
        })}
      </div>
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

