"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { FileText, Download, Eye, Users, Award, Link as LinkIcon, Clock, CheckCircle, XCircle, Edit, Share2 } from "lucide-react";
import Link from "next/link";

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
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {paper.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {paper.institution?.name} • {paper.status.replace('_', ' ')}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
              <Share2 className="h-5 w-5" />
            </button>
            {paper.createdById === user?.id && (
              <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Edit className="h-5 w-5" />
              </button>
            )}
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
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {paper.abstract}
              </p>
            </EnterpriseCardContent>
          </EnterpriseCard>

          {/* Versions */}
          {paper.versions && paper.versions.length > 0 && (
            <EnterpriseCard variant="default">
              <EnterpriseCardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Versions</h2>
                  <Link href={`/papers/${paperId}/versions`} className="text-sm text-brand-600 hover:text-brand-700">
                    View All →
                  </Link>
                </div>
                <div className="space-y-3">
                  {paper.versions.slice(0, 3).map((version: any) => (
                    <div key={version.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Version {version.version}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(version.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {version.id === paper.currentVersionId && (
                        <span className="px-2 py-1 rounded text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
                          Current
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}

          {/* Reviews */}
          {paper.peerReviews && paper.peerReviews.length > 0 && (
            <EnterpriseCard variant="default">
              <EnterpriseCardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Peer Reviews</h2>
                  <Link href={`/papers/${paperId}/reviews`} className="text-sm text-brand-600 hover:text-brand-700">
                    Manage Reviews →
                  </Link>
                </div>
                <div className="space-y-4">
                  {paper.peerReviews.slice(0, 2).map((review: any) => (
                    <div key={review.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {review.reviewer?.fullName}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {review.reviewType}
                        </span>
                      </div>
                      {review.comments && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                          {review.comments}
                        </p>
                      )}
                    </div>
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
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Impact Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{paper.viewCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Downloads</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{paper.downloadCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Citations</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{paper.citationCount || 0}</span>
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          {/* Metadata */}
          <EnterpriseCard variant="default">
            <EnterpriseCardContent className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Metadata</h3>
              <div className="space-y-2 text-sm">
                {paper.doi && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">DOI:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{paper.doi}</span>
                  </div>
                )}
                {paper.orcidId && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">ORCID:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{paper.orcidId}</span>
                  </div>
                )}
                {paper.scopusId && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Scopus ID:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{paper.scopusId}</span>
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

          {/* Collaborators */}
          {paper.collaborators && paper.collaborators.length > 0 && (
            <EnterpriseCard variant="default">
              <EnterpriseCardContent className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Collaborators</h3>
                <div className="space-y-2">
                  {paper.collaborators.map((collab: any) => (
                    <div key={collab.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {collab.user?.fullName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {collab.role.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}
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

