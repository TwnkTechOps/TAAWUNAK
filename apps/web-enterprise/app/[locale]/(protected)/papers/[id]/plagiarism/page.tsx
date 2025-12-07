"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Button } from "components/Button/Button";
import { FileText, Shield, AlertTriangle, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

function PaperPlagiarismPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const paperId = params.id as string;
  const [paper, setPaper] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user && paperId) {
      fetch(`${apiBase}/papers/${paperId}`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          setPaper(data);
          if (data.plagiarismScore !== null) {
            setCheckResult({
              score: data.plagiarismScore,
              report: data.plagiarismReport,
              checkedAt: data.plagiarismCheckedAt
            });
          }
        })
        .catch(err => console.error("Failed to fetch paper:", err));
    }
  }, [user, paperId, apiBase]);

  const handleRunCheck = async () => {
    setChecking(true);
    try {
      const response = await fetch(`${apiBase}/papers/${paperId}/plagiarism-check`, {
        method: "POST",
        credentials: "include"
      });

      if (response.ok) {
        const result = await response.json();
        setCheckResult(result);
        router.refresh();
      } else {
        alert("Failed to run plagiarism check");
      }
    } catch (error) {
      console.error("Error running plagiarism check:", error);
      alert("Failed to run plagiarism check");
    } finally {
      setChecking(false);
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

  const getScoreColor = (score: number) => {
    if (score < 10) return "text-emerald-600 dark:text-emerald-400";
    if (score < 25) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score < 10) return "Low Risk";
    if (score < 25) return "Medium Risk";
    return "High Risk";
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/papers/${paperId}`} className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Paper
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Plagiarism Check
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {paper.title}
        </p>
      </div>

      {/* Run Check Button */}
      {paper.createdById === user?.id && (
        <div className="mb-6">
          <Button onClick={handleRunCheck} disabled={checking}>
            <RefreshCw className={`mr-2 h-5 w-5 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Checking..." : checkResult ? "Re-run Check" : "Run Plagiarism Check"}
          </Button>
        </div>
      )}

      {/* Results */}
      {checkResult ? (
        <div className="space-y-6">
          {/* Score Card */}
          <EnterpriseCard variant={checkResult.score < 10 ? "gradient" : checkResult.score < 25 ? "default" : "default"} className={checkResult.score >= 25 ? "border-2 border-red-500/30" : ""}>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Plagiarism Score
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className={`text-5xl font-bold ${getScoreColor(checkResult.score)}`}>
                      {checkResult.score.toFixed(1)}%
                    </div>
                    <div>
                      <div className={`text-lg font-semibold ${getScoreColor(checkResult.score)}`}>
                        {getScoreLabel(checkResult.score)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Similarity detected
                      </p>
                    </div>
                  </div>
                </div>
                {checkResult.score < 10 ? (
                  <CheckCircle className="h-12 w-12 text-emerald-600" />
                ) : checkResult.score < 25 ? (
                  <AlertTriangle className="h-12 w-12 text-yellow-600" />
                ) : (
                  <AlertTriangle className="h-12 w-12 text-red-600" />
                )}
              </div>
              {checkResult.checkedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  Last checked: {new Date(checkResult.checkedAt).toLocaleString()}
                </p>
              )}
            </EnterpriseCardContent>
          </EnterpriseCard>

          {/* Similarity Matches */}
          {checkResult.similarity && checkResult.similarity.length > 0 && (
            <EnterpriseCard variant="default">
              <EnterpriseCardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Similarity Matches ({checkResult.similarity.length})
                </h3>
                <div className="space-y-4">
                  {checkResult.similarity.map((match: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <Link href={`/papers/${match.paperId}`} className="font-semibold text-gray-900 dark:text-white hover:text-brand-600">
                          {match.paperTitle}
                        </Link>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          match.similarity > 50 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
                          match.similarity > 25 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" :
                          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}>
                          {match.similarity.toFixed(1)}% similar
                        </span>
                      </div>
                      {match.matchedSections && match.matchedSections.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Matched keywords:</p>
                          <div className="flex flex-wrap gap-1">
                            {match.matchedSections.map((section: string, i: number) => (
                              <span key={i} className="px-2 py-1 rounded text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                {section}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}

          {/* Report Details */}
          {checkResult.report && (
            <EnterpriseCard variant="glass">
              <EnterpriseCardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Check Report
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Content Length:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {checkResult.report.contentLength?.toLocaleString() || "N/A"} characters
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Similarity Matches:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {checkResult.report.similarityMatches || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Checked At:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {checkResult.report.checkedAt ? new Date(checkResult.report.checkedAt).toLocaleString() : "N/A"}
                    </span>
                  </div>
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}
        </div>
      ) : (
        <EnterpriseCard variant="glass">
          <EnterpriseCardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No plagiarism check has been run yet</p>
            {paper.createdById === user?.id && (
              <Button onClick={handleRunCheck} disabled={checking}>
                <RefreshCw className={`mr-2 h-5 w-5 ${checking ? "animate-spin" : ""}`} />
                Run Plagiarism Check
              </Button>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </main>
  );
}

export default function PaperPlagiarism() {
  return (
    <ProtectedRoute>
      <PaperPlagiarismPage />
    </ProtectedRoute>
  );
}

