"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from "components/Card";
import { FileText, Plus, Search, Filter, Download, Eye, Users, Award, Link as LinkIcon, Building2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function PapersPage() {
  const { user, loading } = useAuth();
  const [papers, setPapers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user) {
      fetch(`${apiBase}/papers`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => setPapers(data || []))
        .catch(err => console.error("Failed to fetch papers:", err));
    }
  }, [user, apiBase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = !searchTerm || 
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || paper.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'DRAFT': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      'SUBMITTED': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'UNDER_REVIEW': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      'APPROVED': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
      'PUBLISHED': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'REJECTED': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Research Papers
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Submit, track, and manage your research papers
            </p>
          </div>
          <Link href="/papers/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Submit Paper
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search papers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      {/* Papers Grid */}
      {filteredPapers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper, index) => (
            <Link key={paper.id} href={`/papers/${paper.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <EnterpriseCard variant="default" hover className="h-full">
                  <EnterpriseCardContent className="p-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(paper.status)}`}>
                        {paper.status.replace('_', ' ')}
                      </span>
                      {paper.doi && (
                        <LinkIcon className="h-4 w-4 text-brand-600" />
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {paper.title}
                    </h3>

                    {/* Abstract */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {paper.abstract}
                    </p>

                    {/* Metadata */}
                    <div className="space-y-2 mb-4">
                      {paper.institution && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Building2 className="h-3 w-3" />
                          {paper.institution.name}
                        </div>
                      )}
                      {paper.project && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <FileText className="h-3 w-3" />
                          {paper.project.title}
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Eye className="h-3 w-3" />
                        {paper.viewCount || 0}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Download className="h-3 w-3" />
                        {paper.downloadCount || 0}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <LinkIcon className="h-3 w-3" />
                        {paper.citationCount || 0}
                      </div>
                      {paper._count && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Users className="h-3 w-3" />
                          {paper._count.collaborators || 0}
                        </div>
                      )}
                    </div>
                  </EnterpriseCardContent>
                </EnterpriseCard>
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <EnterpriseCard variant="glass">
          <EnterpriseCardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No papers found</p>
            {papers.length === 0 && (
              <Link href="/papers/new" className="mt-4 inline-block text-brand-600 hover:text-brand-700">
                Submit your first paper
              </Link>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </main>
  );
}

export default function Papers() {
  return (
    <ProtectedRoute>
      <PapersPage />
    </ProtectedRoute>
  );
}

