"use client";

import {useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "components/Card/Card";
import {TrendingUp, TrendingDown, Minus, Award, FileText, ClipboardList, Users, Shield} from "lucide-react";

interface ReputationData {
  score: number;
  breakdown: {
    projects: number;
    papers: number;
    proposals: number;
    reviews: number;
    patents: number;
    collaborations: number;
    funding: number;
    credentials: number;
  };
  percentile: number;
  trend: 'up' | 'down' | 'stable';
}

export default function ReputationPage() {
  const [data, setData] = useState<ReputationData | null>(null);
  const [loading, setLoading] = useState(true);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${apiBase}/reputation/me`, {
          credentials: "include"
        });
        if (res.ok) {
          const rep = await res.json();
          setData(rep);
        }
      } catch (e) {
        console.error("Failed to load reputation:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [apiBase]);

  if (loading) {
    return (
      <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
        <div className="text-center py-12">Loading reputation...</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">Unable to load reputation data.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus;
  const trendColor = data.trend === 'up' ? 'text-emerald-500' : data.trend === 'down' ? 'text-red-500' : 'text-gray-500';

  const breakdownItems = [
    {label: "Projects", value: data.breakdown.projects, icon: <FileText className="h-4 w-4" />},
    {label: "Papers", value: data.breakdown.papers, icon: <FileText className="h-4 w-4" />},
    {label: "Proposals", value: data.breakdown.proposals, icon: <ClipboardList className="h-4 w-4" />},
    {label: "Reviews", value: data.breakdown.reviews, icon: <Award className="h-4 w-4" />},
    {label: "Collaborations", value: data.breakdown.collaborations, icon: <Users className="h-4 w-4" />},
    {label: "Credentials", value: data.breakdown.credentials, icon: <Shield className="h-4 w-4" />},
  ];

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      <div>
        <h1 className="title-lg tracking-tight text-gray-900 dark:text-white">Digital Reputation</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Your reputation score based on contributions, publications, and collaborations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Score Card */}
        <Card className="hover-pop glass lg:col-span-2">
          <CardHeader>
            <CardTitle>Reputation Index</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-3">
              <div className="text-5xl font-bold text-gray-900 dark:text-white">{data.score}</div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                <span className={trendColor}>{data.trend === 'up' ? 'Rising' : data.trend === 'down' ? 'Declining' : 'Stable'}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-500">Percentile: </span>
                <span className="font-semibold text-gray-900 dark:text-white">{data.percentile}%</span>
              </div>
            </div>
            <div className="pt-4 border-t dark:border-gray-700">
              <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Score Breakdown</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {breakdownItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      {item.icon}
                      {item.label}
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="hover-pop glass">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>Your reputation score is calculated based on:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Projects: 3 points each</li>
              <li>Papers: 5 points each</li>
              <li>Proposals: 2 points each</li>
              <li>Reviews: 4 points each</li>
              <li>Collaborations: 2 points each</li>
              <li>Credentials: 1 point each</li>
            </ul>
            <p className="pt-2 text-xs">The score reflects your contributions to the research community and helps establish your credibility.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


