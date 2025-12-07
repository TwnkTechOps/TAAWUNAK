"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent, EnterpriseCardHeader, EnterpriseCardTitle } from "components/Card";
import { Button } from "components/Button/Button";
import { FileText, ArrowLeft, ArrowRight, Check, Target, Lightbulb, TrendingUp, Building2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const STEPS = [
  { id: 1, title: "Project Selection", icon: Building2 },
  { id: 2, title: "Proposal Content", icon: FileText },
  { id: 3, title: "Strategic Alignment", icon: Target },
  { id: 4, title: "Review & Submit", icon: Check }
];

const STRATEGIC_ALIGNMENT_OPTIONS = [
  "Vision 2030",
  "Digital Transformation",
  "Artificial Intelligence",
  "Renewable Energy",
  "Healthcare Innovation",
  "Education Technology",
  "Smart Cities",
  "Sustainability",
  "Cybersecurity",
  "Biotechnology",
  "Space Technology",
  "Advanced Manufacturing"
];

function NewProposalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    projectId: "",
    content: "",
    trl: 5,
    strategicAlignment: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user) {
      fetch(`${apiBase}/projects`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => setProjects(data || []))
        .catch(err => console.error("Failed to fetch projects:", err));
    }
  }, [user, apiBase]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.projectId) newErrors.projectId = "Please select a project";
    }
    
    if (step === 2) {
      if (!formData.content.trim()) newErrors.content = "Proposal content is required";
      if (formData.content.length < 500) newErrors.content = "Proposal content must be at least 500 characters";
      if (formData.trl < 1 || formData.trl > 9) newErrors.trl = "TRL must be between 1 and 9";
    }
    
    if (step === 3) {
      if (formData.strategicAlignment.length === 0) {
        newErrors.strategicAlignment = "Please select at least one strategic alignment";
      }
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
      const response = await fetch(`${apiBase}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          projectId: formData.projectId,
          content: formData.content,
          trl: formData.trl,
          strategicAlignment: formData.strategicAlignment
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/proposals/${data.id}`);
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || "Failed to submit proposal" });
      }
    } catch (err) {
      setErrors({ submit: "An error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStrategicAlignment = (option: string) => {
    setFormData(prev => ({
      ...prev,
      strategicAlignment: prev.strategicAlignment.includes(option)
        ? prev.strategicAlignment.filter(a => a !== option)
        : [...prev.strategicAlignment, option]
    }));
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
        <Link href="/proposals" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Proposals
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Create Strategic R&D Proposal
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Submit a comprehensive proposal for AI evaluation and enterprise partnership
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      backgroundColor: isActive ? "#3b82f6" : isCompleted ? "#10b981" : "#e5e7eb"
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      isActive ? "bg-brand-600 text-white" :
                      isCompleted ? "bg-emerald-600 text-white" :
                      "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    }`}
                  >
                    <StepIcon className="h-6 w-6" />
                  </motion.div>
                  <span className={`text-sm font-medium ${
                    isActive ? "text-brand-600 dark:text-brand-400" :
                    isCompleted ? "text-emerald-600 dark:text-emerald-400" :
                    "text-gray-500 dark:text-gray-400"
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 ${
                    isCompleted ? "bg-emerald-600" : "bg-gray-200 dark:bg-gray-700"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <EnterpriseCard variant="default">
        <EnterpriseCardContent className="p-6">
          {/* Step 1: Project Selection */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Select Project
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose the project this proposal is for
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project *
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.projectId ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500`}
                >
                  <option value="">Select a project...</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Proposal Content */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Proposal Content
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Provide detailed information about your research proposal
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proposal Content *
                </label>
                <textarea
                  rows={12}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.content ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500`}
                  placeholder="Describe your research proposal in detail. Include objectives, methodology, expected outcomes, timeline, budget requirements, and impact..."
                />
                <div className="mt-2 flex items-center justify-between">
                  {errors.content && (
                    <p className="text-sm text-red-600">{errors.content}</p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">
                    {formData.content.length} / 500 minimum characters
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Technology Readiness Level (TRL) *
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="9"
                    value={formData.trl}
                    onChange={(e) => setFormData({ ...formData, trl: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <div className="w-16 text-center">
                    <div className="text-2xl font-bold text-brand-600">{formData.trl}</div>
                    <div className="text-xs text-gray-500">TRL</div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  TRL {formData.trl}: {formData.trl <= 3 ? "Basic Research" : formData.trl <= 6 ? "Technology Development" : "System Development"}
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Strategic Alignment */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Strategic Alignment
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Select all areas that align with your proposal and national priorities
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  National Priorities Alignment *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {STRATEGIC_ALIGNMENT_OPTIONS.map(option => (
                    <motion.button
                      key={option}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleStrategicAlignment(option)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.strategicAlignment.includes(option)
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-brand-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{option}</span>
                        {formData.strategicAlignment.includes(option) && (
                          <Check className="h-4 w-4 text-brand-600" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
                {errors.strategicAlignment && (
                  <p className="mt-2 text-sm text-red-600">{errors.strategicAlignment}</p>
                )}
                <p className="mt-3 text-sm text-gray-500">
                  Selected: {formData.strategicAlignment.length} alignment(s)
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Review & Submit
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Review your proposal before submission
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</div>
                  <div className="text-gray-900 dark:text-white">
                    {projects.find(p => p.id === formData.projectId)?.title || "Not selected"}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TRL Level</div>
                  <div className="text-gray-900 dark:text-white">TRL {formData.trl}</div>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Strategic Alignment</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.strategicAlignment.map(align => (
                      <span key={align} className="px-2 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                        {align}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proposal Content</div>
                  <div className="text-gray-900 dark:text-white text-sm line-clamp-4">
                    {formData.content}
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              intent="secondary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            {currentStep < STEPS.length ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Submit Proposal
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

export default function NewProposal() {
  return (
    <ProtectedRoute>
      <NewProposalPage />
    </ProtectedRoute>
  );
}

