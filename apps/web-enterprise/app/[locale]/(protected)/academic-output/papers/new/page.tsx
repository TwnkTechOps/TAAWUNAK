"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Button } from "components/Button/Button";
import { FileText, ArrowLeft, Check, Upload, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const STEPS = [
  { id: 1, title: "Basic Information", fields: ["title", "abstract", "keywords"] },
  { id: 2, title: "Publication Details", fields: ["doi", "journal", "publicationDate"] },
  { id: 3, title: "Authors & Funding", fields: ["authors", "funding"] },
  { id: 4, title: "Classification", fields: ["domainTags", "nationalClassification"] },
  { id: 5, title: "Files & Review", fields: ["file", "review"] }
];

function PaperSubmissionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    keywords: "",
    doi: "",
    journal: "",
    publicationDate: "",
    authors: "",
    funding: "",
    domainTags: "",
    nationalClassification: "",
    projectId: "",
    file: null as File | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (!formData.abstract.trim()) newErrors.abstract = "Abstract is required";
      if (formData.abstract.length < 100) newErrors.abstract = "Abstract must be at least 100 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setSubmitting(true);
    try {
      const keywords = formData.keywords.split(",").map(k => k.trim()).filter(k => k);
      const domainTags = formData.domainTags.split(",").map(t => t.trim()).filter(t => t);
      
      const payload = {
        title: formData.title,
        abstract: formData.abstract,
        keywords,
        domainTags,
        doi: formData.doi || undefined,
        journal: formData.journal || undefined,
        publicationDate: formData.publicationDate || undefined,
        nationalClassification: formData.nationalClassification || undefined,
        projectId: formData.projectId || undefined,
        institutionId: user?.institutionId
      };

      const response = await fetch(`${apiBase}/papers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const paper = await response.json();
        router.push(`/academic-output/papers/${paper.id}`);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to submit paper");
      }
    } catch (error) {
      console.error("Error submitting paper:", error);
      alert("Failed to submit paper");
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
      {/* Header */}
      <div className="mb-8">
        <Link href="/academic-output/papers" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Papers
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Submit Research Paper
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Complete the form to submit your research paper
        </p>
      </div>

      {/* Enhanced Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center relative z-10">
                <motion.div
                  initial={false}
                  animate={{
                    scale: currentStep === step.id ? 1.1 : 1,
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep > step.id ? "bg-brand-600 text-white shadow-lg" :
                    currentStep === step.id ? "bg-brand-600 text-white ring-4 ring-brand-200 dark:ring-brand-800 shadow-xl" :
                    "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}>
                  {currentStep > step.id ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Check className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    step.id
                  )}
                </motion.div>
                <span className={`mt-3 text-xs text-center font-medium max-w-[100px] ${
                  currentStep >= step.id ? "text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400"
                }`}>
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`flex-1 h-1.5 mx-2 rounded-full transition-all ${
                  currentStep > step.id ? "bg-brand-600" : "bg-gray-200 dark:bg-gray-700"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <EnterpriseCard variant="default">
        <EnterpriseCardContent className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Paper Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500`}
                  placeholder="Enter paper title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Abstract <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-gray-500 font-normal">(Minimum 100 characters)</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border transition-all resize-none ${
                    errors.abstract 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                      : formData.abstract.length >= 100
                      ? "border-green-300 dark:border-green-700 focus:border-brand-500 focus:ring-brand-500"
                      : "border-gray-300 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500"
                  } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
                  placeholder="Provide a comprehensive abstract describing your research, methodology, findings, and conclusions..."
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className={`text-xs ${
                    formData.abstract.length < 100 
                      ? "text-gray-500" 
                      : formData.abstract.length < 200
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}>
                    {formData.abstract.length} / 100 characters minimum
                    {formData.abstract.length >= 100 && " ✓"}
                  </p>
                  {formData.abstract.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700`}>
                        <div 
                          className={`h-full transition-all ${
                            formData.abstract.length < 100 
                              ? "bg-red-500" 
                              : formData.abstract.length < 200
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min((formData.abstract.length / 300) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {errors.abstract && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.abstract}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          )}

          {/* Step 2: Publication Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  DOI (Digital Object Identifier)
                </label>
                <input
                  type="text"
                  value={formData.doi}
                  onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="10.xxxx/xxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Journal/Conference Name
                </label>
                <input
                  type="text"
                  value={formData.journal}
                  onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Journal or conference name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publication Date
                </label>
                <input
                  type="date"
                  value={formData.publicationDate}
                  onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Authors & Funding */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Authors (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.authors}
                  onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Author 1, Author 2, Author 3"
                />
                <p className="mt-1 text-xs text-gray-500">You are automatically added as the first author</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Funding Information
                </label>
                <textarea
                  rows={3}
                  value={formData.funding}
                  onChange={(e) => setFormData({ ...formData, funding: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Funding agency, grant number, etc."
                />
              </div>
            </div>
          )}

          {/* Step 4: Classification */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Domain Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.domainTags}
                  onChange={(e) => setFormData({ ...formData, domainTags: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="AI, Data Science, Engineering"
                />
                <p className="mt-1 text-xs text-gray-500">Auto-generated if left empty</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  National Classification
                </label>
                <input
                  type="text"
                  value={formData.nationalClassification}
                  onChange={(e) => setFormData({ ...formData, nationalClassification: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Saudi academic taxonomy classification"
                />
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Review Your Submission</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Title:</span> {formData.title}</div>
                  <div><span className="font-medium">Abstract:</span> {formData.abstract.substring(0, 100)}...</div>
                  {formData.doi && <div><span className="font-medium">DOI:</span> {formData.doi}</div>}
                  {formData.journal && <div><span className="font-medium">Journal:</span> {formData.journal}</div>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Paper (PDF) - Optional
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.file ? formData.file.name : "Click to upload or drag and drop"}
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button type="button" intent="secondary" className="mt-2" as="span">
                      Select File
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              intent="secondary"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="min-w-[100px]"
            >
              ← Back
            </Button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep} of {STEPS.length}
            </div>
            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} className="min-w-[100px]">
                Next →
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="min-w-[140px]">
                {submitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span> Submitting...
                  </>
                ) : (
                  <>
                    ✓ Submit Paper
                  </>
                )}
              </Button>
            )}
          </div>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </main>
  );
}

export default function PaperSubmission() {
  return (
    <ProtectedRoute>
      <PaperSubmissionPage />
    </ProtectedRoute>
  );
}

