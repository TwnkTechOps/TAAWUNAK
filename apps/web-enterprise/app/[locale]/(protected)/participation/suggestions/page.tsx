"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Button } from "components/Button/Button";
import { Lightbulb, ArrowRight, Building2, Users, Calendar } from "lucide-react";
import Link from "next/link";

function SuggestionsPage() {
  const { user, loading } = useAuth();
  const [suggestedProjects, setSuggestedProjects] = useState<any[]>([]);
  const [quota, setQuota] = useState<any>(null);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user?.institutionId) {
      Promise.all([
        fetch(`${apiBase}/participation/suggestions/${user.institutionId}`, {
          credentials: "include"
        }).then(r => r.json()),
        fetch(`${apiBase}/participation/quota/${user.institutionId}`, {
          credentials: "include"
        }).then(r => r.json())
      ]).then(([projects, quotaData]) => {
        setSuggestedProjects(projects || []);
        setQuota(quotaData);
      }).catch(err => console.error("Failed to fetch data:", err));
    }
  }, [user, apiBase]);

  const handleJoinProject = async (projectId: string) => {
    if (!confirm("Join this project?")) return;

    try {
      const response = await fetch(`${apiBase}/participation/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          institutionId: user?.institutionId,
          projectId,
          role: "PARTICIPANT"
        })
      });

      if (response.ok) {
        alert("Successfully joined project!");
        window.location.reload();
      } else {
        alert("Failed to join project");
      }
    } catch (error) {
      console.error("Error joining project:", error);
      alert("Failed to join project");
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
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Suggested Projects
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Projects matched to your institution's quota and skill areas
        </p>
      </div>

      {/* Quota Info */}
      {quota && (
        <EnterpriseCard variant="glass" className="mb-6">
          <EnterpriseCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Your Participation Quota
                </h3>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total: </span>
                    <span className="font-bold text-gray-900 dark:text-white">{quota.totalQuota}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Used: </span>
                    <span className="font-bold text-gray-900 dark:text-white">{quota.usedQuota}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Available: </span>
                    <span className="font-bold text-emerald-600">{quota.availableQuota}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-brand-500/10">
                <Building2 className="h-8 w-8 text-brand-600" />
              </div>
            </div>
            {quota.skillAreas && quota.skillAreas.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Skill Areas:</p>
                <div className="flex flex-wrap gap-2">
                  {quota.skillAreas.map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}

      {/* Suggested Projects */}
      {suggestedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestedProjects.map((project) => (
            <EnterpriseCard key={project.id} variant="default" hover glow>
              <EnterpriseCardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {project.description || "No description"}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-brand-500/10">
                    <Lightbulb className="h-5 w-5 text-brand-600" />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {project.institution && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Building2 className="h-4 w-4" />
                      <span>{project.institution.name}</span>
                    </div>
                  )}
                  {project._count && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{project._count.rdParticipants || 0} participants</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/projects/${project.id}`} className="flex-1">
                    <Button size="sm" intent="secondary" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => handleJoinProject(project.id)}
                    disabled={!quota || quota.availableQuota === 0}
                  >
                    Join Project
                  </Button>
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          ))}
        </div>
      ) : (
        <EnterpriseCard variant="glass">
          <EnterpriseCardContent className="p-12 text-center">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No suggested projects at this time</p>
            <p className="text-sm text-gray-400">
              {quota?.availableQuota === 0
                ? "Your quota is fully utilized. Contact your administrator to increase quota."
                : "Check back later for new project suggestions based on your quota and skills."}
            </p>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </main>
  );
}

export default function Suggestions() {
  return (
    <ProtectedRoute>
      <SuggestionsPage />
    </ProtectedRoute>
  );
}

