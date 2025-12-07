"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Button } from "components/Button/Button";
import { FileText, Download, Eye, Clock, CheckCircle, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

function PaperVersionsPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const paperId = params.id as string;
  const [paper, setPaper] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [showNewVersionForm, setShowNewVersionForm] = useState(false);
  const [newVersionData, setNewVersionData] = useState({
    title: "",
    abstract: "",
    changeLog: ""
  });
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user && paperId) {
      Promise.all([
        fetch(`${apiBase}/papers/${paperId}`, { credentials: "include" }).then(r => r.json()),
        fetch(`${apiBase}/papers/${paperId}`, { credentials: "include" }).then(r => r.json())
      ]).then(([paperData]) => {
        setPaper(paperData);
        setVersions(paperData.versions || []);
        if (paperData.currentVersion) {
          setNewVersionData({
            title: paperData.currentVersion.title,
            abstract: paperData.currentVersion.abstract,
            changeLog: ""
          });
        }
      }).catch(err => console.error("Failed to fetch paper:", err));
    }
  }, [user, paperId, apiBase]);

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiBase}/papers/${paperId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newVersionData)
      });

      if (response.ok) {
        const version = await response.json();
        setVersions([version, ...versions]);
        setShowNewVersionForm(false);
        router.refresh();
      } else {
        alert("Failed to create version");
      }
    } catch (error) {
      console.error("Error creating version:", error);
      alert("Failed to create version");
    }
  };

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
        <Link href={`/papers/${paperId}`} className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Paper
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Version History
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {paper.title}
        </p>
      </div>

      {/* Create New Version */}
      {(paper.createdById === user?.id || paper.collaborators?.some((c: any) => c.userId === user?.id)) && (
        <div className="mb-6">
          {!showNewVersionForm ? (
            <Button onClick={() => setShowNewVersionForm(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Create New Version
            </Button>
          ) : (
            <EnterpriseCard variant="default">
              <EnterpriseCardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Create New Version
                </h3>
                <form onSubmit={handleCreateVersion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={newVersionData.title}
                      onChange={(e) => setNewVersionData({ ...newVersionData, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Abstract
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={newVersionData.abstract}
                      onChange={(e) => setNewVersionData({ ...newVersionData, abstract: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Change Log
                    </label>
                    <textarea
                      rows={3}
                      value={newVersionData.changeLog}
                      onChange={(e) => setNewVersionData({ ...newVersionData, changeLog: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Describe changes in this version..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit">Create Version</Button>
                    <Button type="button" intent="secondary" onClick={() => setShowNewVersionForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}
        </div>
      )}

      {/* Versions List */}
      <div className="space-y-4">
        {versions.length > 0 ? (
          versions.map((version) => (
            <EnterpriseCard
              key={version.id}
              variant={version.id === paper.currentVersionId ? "gradient" : "default"}
              hover
            >
              <EnterpriseCardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Version {version.version}
                      </h3>
                      {version.id === paper.currentVersionId && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
                          Current Version
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {version.title}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                      {version.abstract}
                    </p>
                    {version.changeLog && (
                      <div className="mb-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Changes:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{version.changeLog}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(version.createdAt).toLocaleDateString()}
                      </div>
                      {version.createdBy && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {version.createdBy.fullName}
                        </div>
                      )}
                      {version.size && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {(version.size / 1024).toFixed(1)} KB
                        </div>
                      )}
                    </div>
                  </div>
                  {version.fileUrl && (
                    <div>
                      <a
                        href={version.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  )}
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          ))
        ) : (
          <EnterpriseCard variant="glass">
            <EnterpriseCardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No versions found</p>
            </EnterpriseCardContent>
          </EnterpriseCard>
        )}
      </div>
    </main>
  );
}

export default function PaperVersions() {
  return (
    <ProtectedRoute>
      <PaperVersionsPage />
    </ProtectedRoute>
  );
}

