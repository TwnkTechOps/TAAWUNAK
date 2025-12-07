"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Award, Plus, Search, Filter, Calendar, TrendingUp, Building2, DollarSign, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "components/Button/Button";

function GrantsPage() {
  const { user, loading } = useAuth();
  const [grants, setGrants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user) {
      // Fetch grants from funding applications
      fetch(`${apiBase}/funding/applications`, {
        credentials: "include"
      })
        .then(res => {
          if (!res.ok) {
            return [];
          }
          return res.json();
        })
        .then(data => {
          // Ensure data is an array
          let applications = [];
          if (Array.isArray(data)) {
            applications = data;
          } else if (data && Array.isArray(data.data)) {
            applications = data.data;
          } else if (data && Array.isArray(data.applications)) {
            applications = data.applications;
          }
          
          // Transform applications to grants format
          const grantsData = applications
            .filter((app: any) => app && typeof app === 'object') // Filter out invalid entries
            .map((app: any) => ({
              id: app.id || `grant-${Date.now()}-${Math.random()}`,
              title: String(app.fundingCall?.title || app.project?.title || "Untitled Grant").trim(),
              description: String(app.fundingCall?.description || app.project?.summary || "").trim(),
              amount: Number(app.amount) || 0,
              currency: String(app.currency || "SAR").trim(),
              status: String(app.status || "UNKNOWN").trim(),
              fundingCall: app.fundingCall || null,
              project: app.project || null,
              createdAt: app.createdAt || new Date().toISOString(),
              deadline: app.fundingCall?.deadline || null
            }));
          setGrants(grantsData);
        })
        .catch(err => {
          console.error("Failed to fetch grants:", err);
          setGrants([]);
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

  const filteredGrants = grants.filter(grant => {
    if (!grant) return false;
    const title = (grant.title || "").toLowerCase();
    const description = (grant.description || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = title.includes(search) || description.includes(search);
    const grantStatus = (grant.status || "").toLowerCase();
    const filterStatus = statusFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || grantStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = grants.reduce((sum, g) => sum + (g.amount || 0), 0);
  const approvedAmount = grants.filter(g => g.status === 'APPROVED').reduce((sum, g) => sum + (g.amount || 0), 0);

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Link href="/academic-output" className="hover:text-brand-600">Academic Output</Link>
          <span>/</span>
          <span>Grants & Funding</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Grants & Funding
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Track research grants, funding received, and awards
            </p>
          </div>
          <Link href="/funding">
            <Button>
              <Plus className="mr-2 h-5 w-5" />
              Apply for Funding
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <Award className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {grants.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Grants</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <TrendingUp className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalAmount.toLocaleString()} SAR
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Amount</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <Award className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {grants.filter(g => g.status === 'APPROVED').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Approved</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <TrendingUp className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {approvedAmount.toLocaleString()} SAR
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Approved Amount</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search grants..."
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
        </div>
      </div>

      {/* Grants List */}
      {filteredGrants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGrants.map((grant, index) => (
            <motion.div
              key={grant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <EnterpriseCard variant="default" hover glow className="h-full">
                <EnterpriseCardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      grant.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                      grant.status === 'UNDER_REVIEW' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                      grant.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {(grant.status || 'UNKNOWN').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {grant.title || "Untitled Grant"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {grant.description || "No description available"}
                  </p>
                  {grant.amount > 0 && (
                    <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                      <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                        {typeof grant.amount === 'number' ? grant.amount.toLocaleString() : String(grant.amount || 0)} {grant.currency || 'SAR'}
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">Grant Amount</div>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {grant.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {grant.deadline ? new Date(grant.deadline).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    )}
                    {grant.project && (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span className="truncate max-w-[100px]">{grant.project?.title || 'Unknown Project'}</span>
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
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No grants found</p>
            <Link href="/funding">
              <Button className="mt-4">
                <Plus className="mr-2 h-5 w-5" />
                Apply for Funding
              </Button>
            </Link>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </main>
  );
}

export default function Grants() {
  return (
    <ProtectedRoute>
      <GrantsPage />
    </ProtectedRoute>
  );
}

