"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { FileText, Download, Eye, Users, Award, Link as LinkIcon, Clock, CheckCircle, XCircle, Edit, Share2, ArrowLeft, TrendingUp, Calendar, Building2 } from "lucide-react";
import Link from "next/link";
import { Button } from "components/Button/Button";

function PaperDetailPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const paperId = params.id as string;
  const [paper, setPaper] = useState<any>(null);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user && paperId) {
      fetch(`${apiBase}/papers/${paperId}`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => setPaper(data))
        .catch(err => console.error("Failed to fetch paper:", err));
    }
  }, [user, paperId, apiBase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-8">
        <EnterpriseCard variant="glass">
          <EnterpriseCardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Paper not found</p>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/academic-output/papers" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Papers
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {paper.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{paper.createdBy?.fullName || "Unknown Author"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>{paper.institution?.name || "Unknown Institution"}</span>
              </div>
              {paper.publicationDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(paper.publicationDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            {paper.createdById === user?.id && (
              <Button href={`/papers/${paperId}/edit`} size="sm" intent="secondary">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              paper.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
              paper.status === 'UNDER_REVIEW' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}>
              {paper.status?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Abstract */}
          <EnterpriseCard variant="default">
            <EnterpriseCardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Abstract</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {paper.abstract}
              </p>
            </EnterpriseCardContent>
          </EnterpriseCard>

          {/* Keywords */}
          {paper.keywords && paper.keywords.length > 0 && (
            <EnterpriseCard variant="default">
              <EnterpriseCardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {paper.keywords.map((keyword: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      {keyword}
                    </span>
                  ))}
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}

          {/* Domain Tags */}
          {paper.domainTags && paper.domainTags.length > 0 && (
            <EnterpriseCard variant="default">
              <EnterpriseCardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Research Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {paper.domainTags.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <EnterpriseCard variant="gradient">
            <EnterpriseCardContent className="p-6">
              <h3 className="font-semibold text-white mb-4">Impact Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-white/80" />
                    <span className="text-sm text-white/90">Citations</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{paper.citationCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-white/80" />
                    <span className="text-sm text-white/90">Views</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{paper.viewCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-white/80" />
                    <span className="text-sm text-white/90">Downloads</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{paper.downloadCount || 0}</span>
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          {/* Publication Info */}
          <EnterpriseCard variant="default">
            <EnterpriseCardContent className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Publication Details</h3>
              <div className="space-y-3 text-sm">
                {paper.doi && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">DOI:</span>
                    <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-brand-600 hover:text-brand-700 flex items-center gap-1">
                      {paper.doi}
                      <LinkIcon className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {paper.journal && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Journal:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{paper.journal}</span>
                  </div>
                )}
                {paper.nationalClassification && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Classification:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{paper.nationalClassification}</span>
                  </div>
                )}
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          {/* Quick Actions */}
          <EnterpriseCard variant="default">
            <EnterpriseCardContent className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href={`/papers/${paperId}/versions`} className="block">
                  <Button intent="secondary" size="sm" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    View Versions
                  </Button>
                </Link>
                <Link href={`/papers/${paperId}/reviews`} className="block">
                  <Button intent="secondary" size="sm" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Reviews
                  </Button>
                </Link>
                <Link href={`/papers/${paperId}/citations`} className="block">
                  <Button intent="secondary" size="sm" className="w-full justify-start">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Citations
                  </Button>
                </Link>
                <Link href={`/papers/${paperId}/plagiarism`} className="block">
                  <Button intent="secondary" size="sm" className="w-full justify-start">
                    <Award className="mr-2 h-4 w-4" />
                    Plagiarism Check
                  </Button>
                </Link>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </div>
      </div>
    </main>
  );
}

export default function PaperDetail() {
  return (
    <ProtectedRoute>
      <PaperDetailPage />
    </ProtectedRoute>
  );
}

