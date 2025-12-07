"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseKpiCard } from "components/Card";
import { Award, TrendingUp, CheckCircle, AlertCircle, Lightbulb, Target, BarChart3, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "components/Button/Button";

function EvaluationDashboardPage() {
  const { user, loading } = useAuth();
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [tierStats, setTierStats] = useState<any>(null);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetch(`${apiBase}/proposals`, { credentials: "include" }).then(r => r.json()),
        fetch(`${apiBase}/proposals/tiers/stats`, { credentials: "include" }).then(r => r.json())
      ]).then(([proposalsData, statsData]) => {
        setProposals(proposalsData || []);
        setTierStats(statsData);
      }).catch(err => console.error("Failed to fetch data:", err));
    }
  }, [user, apiBase]);

  const loadEvaluation = async (proposalId: string) => {
    try {
      const [evalData, proposalData] = await Promise.all([
        fetch(`${apiBase}/proposals/${proposalId}/evaluation`, { credentials: "include" }).then(r => r.json()),
        fetch(`${apiBase}/proposals/${proposalId}`, { credentials: "include" }).then(r => r.json())
      ]);
      setEvaluation(evalData);
      setSelectedProposal(proposalData);
    } catch (err) {
      console.error("Failed to load evaluation:", err);
    }
  };

  const triggerEvaluation = async (proposalId: string) => {
    try {
      await fetch(`${apiBase}/proposals/${proposalId}/evaluate`, {
        method: "POST",
        credentials: "include"
      });
      await loadEvaluation(proposalId);
    } catch (err) {
      console.error("Failed to trigger evaluation:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "TIER_1": return "emerald";
      case "TIER_2": return "blue";
      case "TIER_3": return "orange";
      case "TIER_4": return "gray";
      default: return "gray";
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case "TIER_1": return "Tier 1 - Ready for Partnership";
      case "TIER_2": return "Tier 2 - Good Potential";
      case "TIER_3": return "Tier 3 - Early Stage";
      case "TIER_4": return "Tier 4 - Needs Development";
      default: return tier;
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Link href="/proposals" className="hover:text-brand-600">Proposals</Link>
          <span>/</span>
          <span>Evaluation Dashboard</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              AI Evaluation Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Monitor proposal evaluations, tier classifications, and AI insights
            </p>
          </div>
        </div>
      </div>

      {/* Tier Statistics */}
      {tierStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <EnterpriseKpiCard
            label="Tier 1 Proposals"
            value={tierStats.tier1 || 0}
            trend={{ value: tierStats.tier1Percentage || "0", isPositive: true }}
            icon={Award}
            variant="accent"
          />
          <EnterpriseKpiCard
            label="Tier 2 Proposals"
            value={tierStats.tier2 || 0}
            trend={{ value: tierStats.tier2Percentage || "0", isPositive: true }}
            icon={TrendingUp}
            variant="default"
          />
          <EnterpriseKpiCard
            label="Tier 3 Proposals"
            value={tierStats.tier3 || 0}
            trend={{ value: tierStats.tier3Percentage || "0", isPositive: false }}
            icon={AlertCircle}
            variant="default"
          />
          <EnterpriseKpiCard
            label="Tier 4 Proposals"
            value={tierStats.tier4 || 0}
            trend={{ value: tierStats.tier4Percentage || "0", isPositive: false }}
            icon={Target}
            variant="default"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proposals List */}
        <div className="lg:col-span-1">
          <EnterpriseCard variant="default">
            <EnterpriseCardHeader>
              <EnterpriseCardTitle>Proposals</EnterpriseCardTitle>
            </EnterpriseCardHeader>
            <EnterpriseCardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {proposals.map((proposal) => (
                  <motion.div
                    key={proposal.id}
                    whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedProposal?.id === proposal.id ? "bg-brand-50 dark:bg-brand-900/20" : ""
                    }`}
                    onClick={() => loadEvaluation(proposal.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                        {proposal.project?.title || "Untitled"}
                      </h3>
                      {proposal.tier && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${getTierColor(proposal.tier)}-100 text-${getTierColor(proposal.tier)}-700 dark:bg-${getTierColor(proposal.tier)}-900/30 dark:text-${getTierColor(proposal.tier)}-300`}>
                          {proposal.tier.replace("TIER_", "")}
                        </span>
                      )}
                    </div>
                    {proposal.overallScore && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <BarChart3 className="h-3 w-3" />
                        <span>Score: {proposal.overallScore}/100</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </div>

        {/* Evaluation Details */}
        <div className="lg:col-span-2">
          {selectedProposal && evaluation ? (
            <div className="space-y-6">
              {/* Overall Score Card */}
              <EnterpriseCard variant="gradient">
                <EnterpriseCardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {selectedProposal.project?.title || "Untitled Proposal"}
                      </h2>
                      <p className="text-white/80 text-sm">
                        {getTierLabel(selectedProposal.tier || "TIER_4")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-bold text-white mb-1">
                        {evaluation.overallScore || selectedProposal.overallScore || 0}
                      </div>
                      <div className="text-white/80 text-sm">Overall Score</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${evaluation.overallScore || 0}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-white h-3 rounded-full"
                    />
                  </div>
                </EnterpriseCardContent>
              </EnterpriseCard>

              {/* Score Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EnterpriseCard variant="default">
                  <EnterpriseCardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Quality Score</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {evaluation.qualityScore || 0}/100
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${evaluation.qualityScore || 0}%` }}
                      />
                    </div>
                  </EnterpriseCardContent>
                </EnterpriseCard>

                <EnterpriseCard variant="default">
                  <EnterpriseCardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                        <Lightbulb className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Innovation Score</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {evaluation.innovationScore || 0}/100
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${evaluation.innovationScore || 0}%` }}
                      />
                    </div>
                  </EnterpriseCardContent>
                </EnterpriseCard>

                <EnterpriseCard variant="default">
                  <EnterpriseCardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                        <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Feasibility Score</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {evaluation.feasibilityScore || 0}/100
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${evaluation.feasibilityScore || 0}%` }}
                      />
                    </div>
                  </EnterpriseCardContent>
                </EnterpriseCard>

                <EnterpriseCard variant="default">
                  <EnterpriseCardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                        <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Alignment Score</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {evaluation.alignmentScore || 0}/100
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${evaluation.alignmentScore || 0}%` }}
                      />
                    </div>
                  </EnterpriseCardContent>
                </EnterpriseCard>
              </div>

              {/* Evaluation Factors */}
              {evaluation.factors && evaluation.factors.length > 0 && (
                <EnterpriseCard variant="default">
                  <EnterpriseCardHeader>
                    <EnterpriseCardTitle>Evaluation Factors</EnterpriseCardTitle>
                  </EnterpriseCardHeader>
                  <EnterpriseCardContent>
                    <div className="space-y-4">
                      {evaluation.factors.map((factor: any, index: number) => (
                        <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white capitalize">
                              {factor.factor}
                            </span>
                            <span className="text-sm font-medium text-brand-600">
                              {factor.value}/100 (Weight: {factor.weight * 100}%)
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {factor.description}
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                            <div
                              className="bg-brand-600 h-2 rounded-full"
                              style={{ width: `${factor.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </EnterpriseCardContent>
                </EnterpriseCard>
              )}

              {/* Suggestions */}
              {evaluation.suggestions && evaluation.suggestions.length > 0 && (
                <EnterpriseCard variant="default">
                  <EnterpriseCardHeader>
                    <EnterpriseCardTitle>AI Recommendations</EnterpriseCardTitle>
                  </EnterpriseCardHeader>
                  <EnterpriseCardContent>
                    <ul className="space-y-2">
                      {evaluation.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </EnterpriseCardContent>
                </EnterpriseCard>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  onClick={() => triggerEvaluation(selectedProposal.id)}
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Re-evaluate
                </Button>
                <Button
                  href={`/proposals/${selectedProposal.id}`}
                  intent="secondary"
                  className="flex-1"
                >
                  View Full Proposal
                </Button>
              </div>
            </div>
          ) : (
            <EnterpriseCard variant="glass">
              <EnterpriseCardContent className="p-12 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Select a proposal to view evaluation</p>
                <p className="text-sm text-gray-400">
                  Click on a proposal from the list to see detailed AI evaluation results
                </p>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}
        </div>
      </div>
    </main>
  );
}

export default function EvaluationDashboard() {
  return (
    <ProtectedRoute>
      <EvaluationDashboardPage />
    </ProtectedRoute>
  );
}

