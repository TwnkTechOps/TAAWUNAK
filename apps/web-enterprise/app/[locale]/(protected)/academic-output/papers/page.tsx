"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { FileText, Plus, Search, Filter, Download, Eye, Users, Award, Link as LinkIcon, Building2, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "components/Button/Button";

function PapersPage() {
  const { user, loading } = useAuth();
  const [papers, setPapers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [loadingPapers, setLoadingPapers] = useState(true);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user) {
      setLoadingPapers(true);
      fetch(`${apiBase}/papers`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          setPapers(data || []);
          setLoadingPapers(false);
        })
        .catch(err => {
          console.error("Failed to fetch papers:", err);
          setLoadingPapers(false);
        });
    }
  }, [user, apiBase]);

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (paper.keywords && paper.keywords.some((k: string) => k.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesStatus = statusFilter === "all" || paper.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "citations":
        return (b.citationCount || 0) - (a.citationCount || 0);
      case "views":
        return (b.viewCount || 0) - (a.viewCount || 0);
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  if (loading || loadingPapers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Link href="/academic-output" className="hover:text-brand-600">Academic Output</Link>
          <span>/</span>
          <span>Research Papers</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Research Papers
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Manage and track your research publications
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/academic-output/papers/new">
              <Button>
                <Plus className="mr-2 h-5 w-5" />
                Submit Paper
              </Button>
            </Link>
            <Link href="/academic-output/import">
              <Button intent="secondary">
                <Download className="mr-2 h-5 w-5" />
                Import
              </Button>
            </Link>
            {filteredPapers.length > 0 && (
              <Button 
                intent="secondary"
                onClick={() => {
                  const csv = [
                    ['Title', 'Status', 'Citations', 'Views', 'Publication Date'],
                    ...filteredPapers.map(p => [
                      p.title,
                      p.status,
                      p.citationCount || 0,
                      p.viewCount || 0,
                      p.publicationDate ? new Date(p.publicationDate).toLocaleDateString() : ''
                    ])
                  ].map(row => row.join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `papers-export-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="mr-2 h-5 w-5" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <EnterpriseCard variant="glass" className="text-center">
          <EnterpriseCardContent className="py-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {papers.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Papers</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="glass" className="text-center">
          <EnterpriseCardContent className="py-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {papers.reduce((sum, p) => sum + (p.citationCount || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Citations</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="glass" className="text-center">
          <EnterpriseCardContent className="py-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {papers.filter(p => p.status === 'PUBLISHED').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Published</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="glass" className="text-center">
          <EnterpriseCardContent className="py-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {papers.reduce((sum, p) => sum + (p.viewCount || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search papers by title, abstract, or keywords..."
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
            <option value="draft">Draft</option>
            <option value="under_review">Under Review</option>
            <option value="published">Published</option>
          </select>
          <select
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Sort by Recent</option>
            <option value="citations">Sort by Citations</option>
            <option value="views">Sort by Views</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Enhanced Papers Grid */}
      {filteredPapers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper, index) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Link href={`/academic-output/papers/${paper.id}`}>
                <EnterpriseCard variant="default" hover glow className="h-full group">
                  <EnterpriseCardContent className="p-6">
                    {/* Header with Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-600 transition-colors">
                          {paper.title}
                        </h3>
                      </div>
                      <span className={`ml-3 flex-shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        paper.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                        paper.status === 'UNDER_REVIEW' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {paper.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>

                    {/* Abstract */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                      {paper.abstract}
                    </p>

                    {/* Keywords */}
                    {paper.keywords && paper.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {paper.keywords.slice(0, 3).map((keyword: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                            {keyword}
                          </span>
                        ))}
                        {paper.keywords.length > 3 && (
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            +{paper.keywords.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Author & Institution */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            {paper.createdBy?.fullName || "Unknown Author"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {paper.institution?.name || "Unknown Institution"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <div className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-900/20">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {paper.citationCount || 0}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Citations</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-900/20">
                            <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {paper.viewCount || 0}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
                          </div>
                        </div>
                      </div>
                      {paper.publicationDate && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(paper.publicationDate).getFullYear()}</span>
                        </div>
                      )}
                    </div>
                  </EnterpriseCardContent>
                </EnterpriseCard>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <EnterpriseCard variant="glass">
          <EnterpriseCardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {searchTerm || statusFilter !== "all" 
                ? "No papers match your filters" 
                : "No research papers found"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link href="/academic-output/papers/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-5 w-5" />
                  Submit Your First Paper
                </Button>
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

