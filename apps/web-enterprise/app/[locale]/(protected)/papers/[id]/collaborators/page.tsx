"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Button } from "components/Button/Button";
import { Users, UserPlus, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

function PaperCollaboratorsPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const paperId = params.id as string;
  const [paper, setPaper] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user && paperId) {
      fetch(`${apiBase}/papers/${paperId}`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          setPaper(data);
          setCollaborators(data.collaborators || []);
        })
        .catch(err => console.error("Failed to fetch paper:", err));

      // Fetch available users
      fetch(`${apiBase}/users`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => setAvailableUsers(data || []))
        .catch(err => console.error("Failed to fetch users:", err));
    }
  }, [user, paperId, apiBase]);

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      const response = await fetch(`${apiBase}/papers/${paperId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: selectedUserId })
      });

      if (response.ok) {
        const collaborator = await response.json();
        setCollaborators([...collaborators, collaborator]);
        setShowAddForm(false);
        setSelectedUserId("");
        router.refresh();
      } else {
        alert("Failed to add collaborator");
      }
    } catch (error) {
      console.error("Error adding collaborator:", error);
      alert("Failed to add collaborator");
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!confirm("Remove this collaborator?")) return;

    try {
      const response = await fetch(`${apiBase}/papers/${paperId}/collaborators/${collaboratorId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (response.ok) {
        setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
        router.refresh();
      } else {
        alert("Failed to remove collaborator");
      }
    } catch (error) {
      console.error("Error removing collaborator:", error);
      alert("Failed to remove collaborator");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-8">
        <EnterpriseCard variant="glass">
          <EnterpriseCardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Paper not found</p>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </main>
    );
  }

  const canManage = paper.createdById === user?.id;
  const existingUserIds = new Set([paper.createdById, ...collaborators.map((c: any) => c.userId)]);

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/papers/${paperId}`} className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Paper
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Collaborators
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {paper.title}
        </p>
      </div>

      {/* Add Collaborator */}
      {canManage && (
        <div className="mb-6">
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)}>
              <UserPlus className="mr-2 h-5 w-5" />
              Add Collaborator
            </Button>
          ) : (
            <EnterpriseCard variant="default">
              <EnterpriseCardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Add Collaborator
                </h3>
                <form onSubmit={handleAddCollaborator} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select User
                    </label>
                    <select
                      required
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">Select user...</option>
                      {availableUsers
                        .filter(u => !existingUserIds.has(u.id))
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.fullName} ({u.email})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit">Add Collaborator</Button>
                    <Button type="button" intent="secondary" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}
        </div>
      )}

      {/* Collaborators List */}
      <div className="space-y-4">
        {/* Creator */}
        <EnterpriseCard variant="gradient">
          <EnterpriseCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {paper.createdBy?.fullName || "Unknown"}
                  </h3>
                  <p className="text-sm text-white/80">
                    {paper.createdBy?.email}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                Creator
              </span>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>

        {/* Collaborators */}
        {collaborators.length > 0 ? (
          collaborators.map((collaborator) => (
            <EnterpriseCard key={collaborator.id} variant="default" hover>
              <EnterpriseCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-brand-500/10">
                      <Users className="h-6 w-6 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {collaborator.user?.fullName || "Unknown"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {collaborator.user?.email}
                      </p>
                    </div>
                  </div>
                  {canManage && (
                    <button
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          ))
        ) : (
          <EnterpriseCard variant="glass">
            <EnterpriseCardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No collaborators added yet</p>
            </EnterpriseCardContent>
          </EnterpriseCard>
        )}
      </div>
    </main>
  );
}

export default function PaperCollaborators() {
  return (
    <ProtectedRoute>
      <PaperCollaboratorsPage />
    </ProtectedRoute>
  );
}

