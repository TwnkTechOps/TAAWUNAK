"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Button } from "components/Button/Button";
import { FileText, Link as LinkIcon, Plus, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

function PaperCitationsPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const paperId = params.id as string;
  const [paper, setPaper] = useState<any>(null);
  const [citations, setCitations] = useState<any[]>([]);
  const [citedBy, setCitedBy] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({
    citedPaperId: "",
    citationType: "REFERENCE" as "REFERENCE" | "IN_TEXT" | "FOOTNOTE",
    context: ""
  });
  const [availablePapers, setAvailablePapers] = useState<any[]>([]);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user && paperId) {
      fetch(`${apiBase}/papers/${paperId}`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          setPaper(data);
          setCitations(data.citations || []);
          setCitedBy(data.citedBy || []);
        })
        .catch(err => console.error("Failed to fetch paper:", err));

      // Fetch available papers for citation
      fetch(`${apiBase}/papers`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => setAvailablePapers(data.filter((p: any) => p.id !== paperId)))
        .catch(err => console.error("Failed to fetch papers:", err));
    }
  }, [user, paperId, apiBase]);

  const handleAddCitation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiBase}/papers/${paperId}/citations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(addFormData)
      });

      if (response.ok) {
        const citation = await response.json();
        setCitations([...citations, citation]);
        setShowAddForm(false);
        setAddFormData({ citedPaperId: "", citationType: "REFERENCE", context: "" });
        router.refresh();
      } else {
        alert("Failed to add citation");
      }
    } catch (error) {
      console.error("Error adding citation:", error);
      alert("Failed to add citation");
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
          Citations
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {paper.title}
        </p>
      </div>

      {/* Add Citation */}
      {paper.createdById === user?.id && (
        <div className="mb-6">
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Add Citation
            </Button>
          ) : (
            <EnterpriseCard variant="default">
              <EnterpriseCardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Add Citation
                </h3>
                <form onSubmit={handleAddCitation} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cited Paper
                    </label>
                    <select
                      required
                      value={addFormData.citedPaperId}
                      onChange={(e) => setAddFormData({ ...addFormData, citedPaperId: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">Select paper...</option>
                      {availablePapers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Citation Type
                    </label>
                    <select
                      required
                      value={addFormData.citationType}
                      onChange={(e) => setAddFormData({ ...addFormData, citationType: e.target.value as any })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="REFERENCE">Reference</option>
                      <option value="IN_TEXT">In-Text Citation</option>
                      <option value="FOOTNOTE">Footnote</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Context (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={addFormData.context}
                      onChange={(e) => setAddFormData({ ...addFormData, context: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Where this citation appears in the paper..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit">Add Citation</Button>
                    <Button type="button" intent="secondary" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citations (This paper cites) */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            References ({citations.length})
          </h2>
          {citations.length > 0 ? (
            <div className="space-y-4">
              {citations.map((citation) => (
                <EnterpriseCard key={citation.id} variant="default" hover>
                  <EnterpriseCardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/papers/${citation.citedPaper?.id}`}>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 hover:text-brand-600">
                            {citation.citedPaper?.title || "Unknown Paper"}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {citation.citationType.replace('_', ' ')}
                          </span>
                        </div>
                        {citation.context && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            "{citation.context}"
                          </p>
                        )}
                      </div>
                      <Link href={`/papers/${citation.citedPaper?.id}`}>
                        <ExternalLink className="h-5 w-5 text-brand-600 hover:text-brand-700" />
                      </Link>
                    </div>
                  </EnterpriseCardContent>
                </EnterpriseCard>
              ))}
            </div>
          ) : (
            <EnterpriseCard variant="glass">
              <EnterpriseCardContent className="p-12 text-center">
                <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No citations added yet</p>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}
        </div>

        {/* Cited By (Papers citing this) */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Cited By ({citedBy.length})
          </h2>
          {citedBy.length > 0 ? (
            <div className="space-y-4">
              {citedBy.map((citation) => (
                <EnterpriseCard key={citation.id} variant="default" hover>
                  <EnterpriseCardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/papers/${citation.citingPaper?.id}`}>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 hover:text-brand-600">
                            {citation.citingPaper?.title || "Unknown Paper"}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {citation.citationType.replace('_', ' ')}
                          </span>
                        </div>
                        {citation.context && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            "{citation.context}"
                          </p>
                        )}
                      </div>
                      <Link href={`/papers/${citation.citingPaper?.id}`}>
                        <ExternalLink className="h-5 w-5 text-brand-600 hover:text-brand-700" />
                      </Link>
                    </div>
                  </EnterpriseCardContent>
                </EnterpriseCard>
              ))}
            </div>
          ) : (
            <EnterpriseCard variant="glass">
              <EnterpriseCardContent className="p-12 text-center">
                <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">This paper hasn't been cited yet</p>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PaperCitations() {
  return (
    <ProtectedRoute>
      <PaperCitationsPage />
    </ProtectedRoute>
  );
}

