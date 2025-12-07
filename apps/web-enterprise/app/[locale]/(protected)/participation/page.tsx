"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Users, TrendingUp, UserPlus, Mail, BarChart3, Users2, Award, Lightbulb } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function ParticipationPage() {
  const { user, loading, isAdmin, isInstitutionAdmin } = useAuth();
  const [quota, setQuota] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user) {
      setDataLoading(true);
      const fetchPromises = [];
      
      if (user.institutionId) {
        fetchPromises.push(
          fetch(`${apiBase}/participation/quota/${user.institutionId}`, { credentials: "include" })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        );
        fetchPromises.push(
          fetch(`${apiBase}/participation/participants?institutionId=${user.institutionId}`, { credentials: "include" })
            .then(r => r.ok ? r.json() : [])
            .catch(() => [])
        );
        fetchPromises.push(
          fetch(`${apiBase}/participation/analytics?institutionId=${user.institutionId}`, { credentials: "include" })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        );
      } else if (isAdmin) {
        // Admin can see all data
        fetchPromises.push(
          fetch(`${apiBase}/participation/quota`, { credentials: "include" })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        );
        fetchPromises.push(
          fetch(`${apiBase}/participation/participants`, { credentials: "include" })
            .then(r => r.ok ? r.json() : [])
            .catch(() => [])
        );
        fetchPromises.push(
          fetch(`${apiBase}/participation/analytics`, { credentials: "include" })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        );
      }

      if (fetchPromises.length > 0) {
        Promise.all(fetchPromises).then(([quotaData, participantsData, analyticsData]) => {
          setQuota(quotaData);
          setParticipants(Array.isArray(participantsData) ? participantsData : []);
          setAnalytics(analyticsData);
          setDataLoading(false);
        }).catch(err => {
          console.error("Failed to fetch data:", err);
          setDataLoading(false);
        });
      } else {
        setDataLoading(false);
      }
    } else {
      setDataLoading(false);
    }
  }, [user, apiBase, isAdmin]);

  const utilizationRate = quota && quota.totalQuota > 0 
    ? (quota.usedQuota / quota.totalQuota) * 100 
    : 0;

  // Default quota structure if no data
  const displayQuota = quota || {
    totalQuota: 0,
    usedQuota: 0,
    availableQuota: 0,
    genderQuota: null
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading participation data...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8" style={{ minHeight: '400px' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Inclusive R&D Participation
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Manage participation quotas and track engagement across education tiers
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <Users className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {dataLoading ? "..." : displayQuota.totalQuota}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Quota</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <UserPlus className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {dataLoading ? "..." : displayQuota.usedQuota}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Used Quota</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <TrendingUp className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {dataLoading ? "..." : displayQuota.availableQuota}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <BarChart3 className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {dataLoading ? "..." : Math.round(utilizationRate)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Utilization</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      {/* Gender Equality Stats */}
      {displayQuota?.genderQuota && (
        <div className="mb-8">
          <EnterpriseCard variant="glass">
            <EnterpriseCardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Gender Equality Tracking
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Male</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {displayQuota.genderQuota.maleUsed || 0} / {displayQuota.genderQuota.maleQuota || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {displayQuota.genderQuota.maleQuota > 0 
                      ? Math.round((displayQuota.genderQuota.maleUsed / displayQuota.genderQuota.maleQuota) * 100) 
                      : 0}% utilized
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-900/30">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Female</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {displayQuota.genderQuota.femaleUsed || 0} / {displayQuota.genderQuota.femaleQuota || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {displayQuota.genderQuota.femaleQuota > 0 
                      ? Math.round((displayQuota.genderQuota.femaleUsed / displayQuota.genderQuota.femaleQuota) * 100) 
                      : 0}% utilized
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Other</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {displayQuota.genderQuota.otherUsed || 0} / {displayQuota.genderQuota.otherQuota || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {displayQuota.genderQuota.otherQuota > 0 
                      ? Math.round((displayQuota.genderQuota.otherUsed / displayQuota.genderQuota.otherQuota) * 100) 
                      : 0}% utilized
                  </div>
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </div>
      )}

      {/* Actions */}
      {(isAdmin || isInstitutionAdmin) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/participation/quota">
            <EnterpriseCard variant="default" hover>
              <EnterpriseCardContent className="p-6 text-center">
                <Award className="h-8 w-8 text-brand-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Manage Quota
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Allocate and adjust participation quotas
                </p>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </Link>
          <Link href="/participation/invitations">
            <EnterpriseCard variant="default" hover>
              <EnterpriseCardContent className="p-6 text-center">
                <Mail className="h-8 w-8 text-brand-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Send Invitations
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Invite lower-tier institutions
                </p>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </Link>
          <Link href="/participation/analytics">
            <EnterpriseCard variant="default" hover>
              <EnterpriseCardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-brand-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Analytics
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View participation metrics
                </p>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/participation/quota">
          <EnterpriseCard variant="default" hover className="h-full">
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-brand-500/10">
                  <Award className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Manage Quota</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View and update quotas</p>
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </Link>
        <Link href="/participation/invitations">
          <EnterpriseCard variant="default" hover className="h-full">
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <Mail className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Invitations</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage invitations</p>
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </Link>
        <Link href="/participation/suggestions">
          <EnterpriseCard variant="default" hover className="h-full">
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Lightbulb className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Suggestions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Find matching projects</p>
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </Link>
      </div>

      {/* Participants List */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Active Participants
        </h2>
        {participants.length > 0 ? (
          <div className="space-y-4">
            {participants.map((participant) => (
              <EnterpriseCard key={participant.id} variant="default" hover>
                <EnterpriseCardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-brand-500/10">
                        <Users2 className="h-6 w-6 text-brand-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {participant.user?.fullName || "Unknown"}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {participant.role} • {participant.skillArea || "No skill area"}
                          {participant.gender && ` • ${participant.gender}`}
                        </p>
                      </div>
                    </div>
                    {participant.project && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {participant.project.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Project
                        </p>
                      </div>
                    )}
                  </div>
                </EnterpriseCardContent>
              </EnterpriseCard>
            ))}
          </div>
        ) : (
          <EnterpriseCard variant="glass">
            <EnterpriseCardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No participants yet</p>
            </EnterpriseCardContent>
          </EnterpriseCard>
        )}
      </div>
    </main>
  );
}

function Participation() {
  return (
    <ProtectedRoute>
      <ParticipationPage />
    </ProtectedRoute>
  );
}

export default Participation;

