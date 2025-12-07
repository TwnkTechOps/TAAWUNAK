"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Button } from "components/Button/Button";
import { FileText, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";

function NewPaperPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    keywords: "",
    domainTags: "",
    projectId: "",
    institutionId: user?.institutionId || "",
    nationalClassification: "",
    orcidId: "",
    scopusId: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Upload file first if provided
      let fileUrl, s3Key, contentType, size;
      if (file) {
        // In production, upload to S3/MinIO
        // For now, just prepare the data
        contentType = file.type;
        size = file.size;
        s3Key = `papers/${Date.now()}-${file.name}`;
        fileUrl = `/files/${s3Key}`;
      }

      const response = await fetch(`${apiBase}/papers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          keywords: formData.keywords.split(",").map(k => k.trim()).filter(k => k),
          domainTags: formData.domainTags.split(",").map(t => t.trim()).filter(t => t),
          fileUrl,
          s3Key,
          contentType,
          size
        })
      });

      if (response.ok) {
        const paper = await response.json();
        router.push(`/papers/${paper.id}`);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to create paper");
      }
    } catch (error) {
      console.error("Error creating paper:", error);
      alert("Failed to create paper");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Submit Research Paper
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Upload and register your research paper
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <EnterpriseCard variant="default">
          <EnterpriseCardContent className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paper Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Enter paper title"
              />
            </div>

            {/* Abstract */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Abstract *
              </label>
              <textarea
                required
                rows={6}
                value={formData.abstract}
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Enter paper abstract"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            {/* Domain Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Domain Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.domainTags}
                onChange={(e) => setFormData({ ...formData, domainTags: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="AI, Machine Learning, Research"
              />
            </div>

            {/* National Classification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                National Classification (Saudi Taxonomy)
              </label>
              <input
                type="text"
                value={formData.nationalClassification}
                onChange={(e) => setFormData({ ...formData, nationalClassification: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Enter classification code"
              />
            </div>

            {/* ORCID & Scopus */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ORCID ID
                </label>
                <input
                  type="text"
                  value={formData.orcidId}
                  onChange={(e) => setFormData({ ...formData, orcidId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="0000-0000-0000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scopus ID
                </label>
                <input
                  type="text"
                  value={formData.scopusId}
                  onChange={(e) => setFormData({ ...formData, scopusId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Enter Scopus ID"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paper File (PDF)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                {file ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-brand-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload or drag and drop
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? "Submitting..." : "Submit Paper"}
              </Button>
              <Button
                type="button"
                intent="secondary"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </form>
    </main>
  );
}

export default function NewPaper() {
  return (
    <ProtectedRoute>
      <NewPaperPage />
    </ProtectedRoute>
  );
}

