"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Search, Filter, Award, TrendingUp, Building2, Users, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "components/Button/Button";

function EnterpriseBrowsePage() {
  const { user, loading } = useAuth();
  const [proposals, setProposals] = useState<any[]>([]);
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user) {
      const url = tierFilter !== "all" 
        ? `${apiBase}/proposals/enterprise/browse?tier=${tierFilter}`
        : `${apiBase}/proposals/enterprise/browse`;
      
      fetch(url, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => setProposals(data || []))
        .catch(err => console.error("Failed to fetch proposals:", err));
    }
  }, [user, tierFilter, apiBase]);

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
    return matchesSearch;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "TIER_1": return "from-emerald-500 to-teal-500";
      case "TIER_2": return "from-blue-500 to-cyan-500";
      case "TIER_3": return "from-orange-500 to-amber-500";
      case "TIER_4": return "from-gray-500 to-gray-600";
      default: return "from-gray-500 to-gray-600";
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Browse University Proposals
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Discover high-quality research proposals from universities ready for partnership
        </p>
      </div>

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
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
          >
            <option value="all">All Tiers</option>
            <option value="TIER_1">Tier 1 - Ready</option>
            <option value="TIER_2">Tier 2 - Good Potential</option>
            <option value="TIER_3">Tier 3 - Early Stage</option>
            <option value="TIER_4">Tier 4 - Needs Development</option>
          </select>
        </div>
      </div>

      {/* Proposals Grid */}
      {filteredProposals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProposals.map((proposal, index) => (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <EnterpriseCard variant="default" hover glow className="h-full">
                <EnterpriseCardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${getTierColor(proposal.tier || "TIER_4")}`}>
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getTierColor(proposal.tier || "TIER_4")} text-white`}>
                      {getTierLabel(proposal.tier || "TIER_4")}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {proposal.project?.title || "Untitled Proposal"}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {proposal.content?.substring(0, 150) || "No description available"}...
                  </p>

                  {proposal.evaluation && (
                    <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Overall Score</span>
                        <span className="font-bold text-brand-600">{proposal.evaluation.overallScore}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full"
                          style={{ width: `${proposal.evaluation.overallScore}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span className="truncate max-w-[120px]">{proposal.project?.institution?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{proposal._count?.enterpriseInterests || 0} interested</span>
                    </div>
                  </div>

                  <Button
                    href={`/proposals/${proposal.id}`}
                    className="w-full mt-4"
                    size="sm"
                  >
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </EnterpriseCardContent>
              </EnterpriseCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <EnterpriseCard variant="glass">
          <EnterpriseCardContent className="p-12 text-center">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No proposals found</p>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </main>
  );
}

export default function EnterpriseBrowse() {
  return (
    <ProtectedRoute>
      <EnterpriseBrowsePage />
    </ProtectedRoute>
  );
}

