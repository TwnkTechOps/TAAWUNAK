"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseKpiCard } from "components/Card";
import { FileText, Plus, Search, Filter, Award, TrendingUp, Building2, ArrowRight, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "components/Button/Button";

function ProposalsPage() {
  const { user, loading, isResearcher, isAdmin, isInstitutionAdmin } = useAuth();
  const [proposals, setProposals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user) {
      fetch(`${apiBase}/proposals`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => setProposals(data || []))
        .catch(err => console.error("Failed to fetch proposals:", err));
    }
  }, [user, apiBase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = (p.project?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.content || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || (p.status || "").toLowerCase() === statusFilter.toLowerCase();
    const matchesTier = tierFilter === "all" || (p.tier || "") === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const stats = {
    total: proposals.length,
    approved: proposals.filter(p => p.status === "APPROVED").length,
    pending: proposals.filter(p => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW").length,
    tier1: proposals.filter(p => p.tier === "TIER_1").length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "emerald";
      case "SUBMITTED":
      case "UNDER_REVIEW": return "blue";
      case "REJECTED": return "red";
      default: return "gray";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "TIER_1": return "emerald";
      case "TIER_2": return "blue";
      case "TIER_3": return "orange";
      case "TIER_4": return "gray";
      default: return "gray";
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Research Proposals
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Manage and track your strategic R&D proposals
            </p>
          </div>
          {(isResearcher || isInstitutionAdmin) && (
            <Link href="/proposals/new">
              <Button>
                <Plus className="mr-2 h-5 w-5" />
                Create Proposal
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <EnterpriseKpiCard
          label="Total Proposals"
          value={stats.total}
          icon={FileText}
          variant="accent"
        />
        <EnterpriseKpiCard
          label="Approved"
          value={stats.approved}
          trend={{ value: `${stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0}%`, isPositive: true }}
          icon={CheckCircle}
          variant="default"
        />
        <EnterpriseKpiCard
          label="Pending Review"
          value={stats.pending}
          icon={Clock}
          variant="default"
        />
        <EnterpriseKpiCard
          label="Tier 1 Proposals"
          value={stats.tier1}
          icon={Award}
          variant="default"
        />
      </div>

      {/* Quick Actions */}
      {(isAdmin || isInstitutionAdmin) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link href="/proposals/evaluation">
            <EnterpriseCard variant="default" hover className="h-full">
              <EnterpriseCardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Evaluation Dashboard</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View AI evaluations and tier classifications</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </Link>
          {isAdmin && (
            <Link href="/proposals/dashboard">
              <EnterpriseCard variant="default" hover className="h-full">
                <EnterpriseCardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">Decision Maker Dashboard</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">National-level insights and analytics</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </EnterpriseCardContent>
              </EnterpriseCard>
            </Link>
          )}
          <Link href="/proposals/enterprise">
            <EnterpriseCard variant="default" hover className="h-full">
              <EnterpriseCardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Enterprise Browse</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View proposals as enterprises see them</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search proposals..."
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
          >
            <option value="all">All Tiers</option>
            <option value="TIER_1">Tier 1</option>
            <option value="TIER_2">Tier 2</option>
            <option value="TIER_3">Tier 3</option>
            <option value="TIER_4">Tier 4</option>
          </select>
        </div>
      </div>

      {/* Proposals List */}
      {filteredProposals.length > 0 ? (
        <div className="space-y-4">
          {filteredProposals.map((proposal, index) => (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <EnterpriseCard variant="default" hover glow>
                <EnterpriseCardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/30">
                          <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {proposal.project?.title || "Untitled Proposal"}
                          </h3>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(proposal.status)}-100 text-${getStatusColor(proposal.status)}-700 dark:bg-${getStatusColor(proposal.status)}-900/30 dark:text-${getStatusColor(proposal.status)}-300`}>
                              {proposal.status?.replace("_", " ")}
                            </span>
                            {proposal.tier && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getTierColor(proposal.tier)}-100 text-${getTierColor(proposal.tier)}-700 dark:bg-${getTierColor(proposal.tier)}-900/30 dark:text-${getTierColor(proposal.tier)}-300`}>
                                {proposal.tier.replace("TIER_", "Tier ")}
                              </span>
                            )}
                            {proposal.overallScore && (
                              <span className="text-sm font-semibold text-brand-600">
                                Score: {proposal.overallScore}/100
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {proposal.content?.substring(0, 200) || "No description available"}...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{proposal.project?.institution?.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Link href={`/proposals/${proposal.id}`}>
                        <Button size="sm" intent="secondary">
                          View
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </EnterpriseCardContent>
              </EnterpriseCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <EnterpriseCard variant="glass">
          <EnterpriseCardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No proposals found</p>
            {(isResearcher || isInstitutionAdmin) && (
              <Link href="/proposals/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Proposal
                </Button>
              </Link>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </main>
  );
}

export default function Proposals() {
  return (
    <ProtectedRoute>
      <ProposalsPage />
    </ProtectedRoute>
  );
}

