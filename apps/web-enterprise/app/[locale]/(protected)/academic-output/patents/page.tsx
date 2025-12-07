"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Briefcase, Plus, Search, Filter, Calendar, FileText, Building2, Award, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "components/Button/Button";

function PatentsPage() {
  const { user, loading } = useAuth();
  const [patents, setPatents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user) {
      // Fetch patents - using project patents relation
      fetch(`${apiBase}/projects`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          // Extract patents from projects
          const patentsData: any[] = [];
          (data || []).forEach((project: any) => {
            if (project.patents && project.patents.length > 0) {
              project.patents.forEach((patent: any) => {
                patentsData.push({
                  ...patent,
                  project: project
                });
              });
            }
          });
          setPatents(patentsData);
        })
        .catch(err => {
          console.error("Failed to fetch patents:", err);
          setPatents([]);
        });
    }
  }, [user, apiBase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const filteredPatents = patents.filter(patent => {
    const matchesSearch = (patent.title || patent.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (patent.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || (patent.status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Link href="/academic-output" className="hover:text-brand-600">Academic Output</Link>
          <span>/</span>
          <span>Patents</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Patents
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Manage intellectual property, patents, and innovations
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-5 w-5" />
            Register Patent
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <Briefcase className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {patents.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Patents</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <Award className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {patents.filter(p => p.status === 'GRANTED' || p.status === 'APPROVED').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Granted</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <FileText className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {patents.filter(p => p.status === 'PENDING').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Pending</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <Building2 className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(patents.map(p => p.project?.institutionId)).size}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Institutions</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search patents..."
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
            <option value="pending">Pending</option>
            <option value="granted">Granted</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Patents List */}
      {filteredPatents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatents.map((patent, index) => (
            <motion.div
              key={patent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <EnterpriseCard variant="default" hover glow className="h-full">
                <EnterpriseCardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      patent.status === 'GRANTED' || patent.status === 'APPROVED' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                      patent.status === 'PENDING' 
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {patent.status || 'PENDING'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {patent.title || patent.name || "Untitled Patent"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {patent.description || "No description available"}
                  </p>
                  {patent.patentNumber && (
                    <div className="mb-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <div className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                        Patent #{patent.patentNumber}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {patent.filingDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Filed: {new Date(patent.filingDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {patent.project && (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span className="truncate max-w-[100px]">{patent.project.title}</span>
                      </div>
                    )}
                  </div>
                </EnterpriseCardContent>
              </EnterpriseCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <EnterpriseCard variant="glass">
          <EnterpriseCardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No patents registered yet</p>
            <Button className="mt-4">
              <Plus className="mr-2 h-5 w-5" />
              Register Your First Patent
            </Button>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </main>
  );
}

export default function Patents() {
  return (
    <ProtectedRoute>
      <PatentsPage />
    </ProtectedRoute>
  );
}

