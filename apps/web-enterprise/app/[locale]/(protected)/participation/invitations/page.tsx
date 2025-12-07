"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Button } from "components/Button/Button";
import { Mail, UserPlus, CheckCircle, XCircle, Clock, ArrowRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

function InvitationsPage() {
  const { user, loading, isAdmin, isInstitutionAdmin } = useAuth();
  const router = useRouter();
  const [sentInvitations, setSentInvitations] = useState<any[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<any[]>([]);
  const [showSendForm, setShowSendForm] = useState(false);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    invitedInstitutionId: "",
    projectId: "",
    skillAreas: "",
    quotaAllocated: "",
    message: ""
  });
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user) {
      // Fetch invitations
      Promise.all([
        fetch(`${apiBase}/participation/invitations?institutionId=${user.institutionId}`, { credentials: "include" }).then(r => r.json()),
        fetch(`${apiBase}/participation/invitations?invitedInstitutionId=${user.institutionId}`, { credentials: "include" }).then(r => r.json()),
        fetch(`${apiBase}/institutions`, { credentials: "include" }).then(r => r.json()),
        fetch(`${apiBase}/projects`, { credentials: "include" }).then(r => r.json())
      ]).then(([sent, received, insts, projs]) => {
        setSentInvitations(sent || []);
        setReceivedInvitations(received || []);
        setInstitutions(insts || []);
        setProjects(projs || []);
      }).catch(err => console.error("Failed to fetch data:", err));
    }
  }, [user, apiBase]);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiBase}/participation/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          institutionId: user?.institutionId,
          invitedInstitutionId: formData.invitedInstitutionId,
          projectId: formData.projectId || undefined,
          skillAreas: formData.skillAreas.split(",").map(s => s.trim()).filter(s => s),
          quotaAllocated: formData.quotaAllocated ? parseInt(formData.quotaAllocated) : undefined,
          message: formData.message
        })
      });

      if (response.ok) {
        const invitation = await response.json();
        setSentInvitations([invitation, ...sentInvitations]);
        setShowSendForm(false);
        setFormData({ invitedInstitutionId: "", projectId: "", skillAreas: "", quotaAllocated: "", message: "" });
      } else {
        alert("Failed to send invitation");
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      alert("Failed to send invitation");
    }
  };

  const handleRespond = async (invitationId: string, response: "ACCEPTED" | "DECLINED") => {
    try {
      const res = await fetch(`${apiBase}/participation/invitations/${invitationId}/respond`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          institutionId: user?.institutionId,
          response
        })
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to respond to invitation");
      }
    } catch (error) {
      console.error("Error responding to invitation:", error);
      alert("Failed to respond to invitation");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'DECLINED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'EXPIRED':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Participation Invitations
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Manage invitations to collaborate on R&D projects
        </p>
      </div>

      {/* Send Invitation */}
      {(isAdmin || isInstitutionAdmin) && (
        <div className="mb-6">
          {!showSendForm ? (
            <Button onClick={() => setShowSendForm(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Send Invitation
            </Button>
          ) : (
            <EnterpriseCard variant="default">
              <EnterpriseCardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Send Invitation to Lower-Tier Institution
                </h3>
                <form onSubmit={handleSendInvitation} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Invite Institution
                    </label>
                    <select
                      required
                      value={formData.invitedInstitutionId}
                      onChange={(e) => setFormData({ ...formData, invitedInstitutionId: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">Select institution...</option>
                      {institutions
                        .filter(inst => inst.id !== user?.institutionId)
                        .map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            {inst.name} ({inst.type})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Project (Optional)
                    </label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">No specific project</option>
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Skill Areas (comma-separated)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.skillAreas}
                      onChange={(e) => setFormData({ ...formData, skillAreas: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="AI, Data Science, Engineering"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quota Allocated (Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quotaAllocated}
                      onChange={(e) => setFormData({ ...formData, quotaAllocated: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Number of participants"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Invitation message..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit">Send Invitation</Button>
                    <Button type="button" intent="secondary" onClick={() => setShowSendForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Received Invitations */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Received Invitations ({receivedInvitations.length})
          </h2>
          {receivedInvitations.length > 0 ? (
            <div className="space-y-4">
              {receivedInvitations.map((invitation) => (
                <EnterpriseCard key={invitation.id} variant="default" hover>
                  <EnterpriseCardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(invitation.status)}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {invitation.institution?.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Invited by {invitation.invitedByUser?.fullName}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        invitation.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                        invitation.status === 'DECLINED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        invitation.status === 'EXPIRED' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {invitation.status}
                      </span>
                    </div>
                    {invitation.project && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Project: {invitation.project.title}
                      </p>
                    )}
                    {invitation.skillAreas && invitation.skillAreas.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Skill Areas:</p>
                        <div className="flex flex-wrap gap-1">
                          {invitation.skillAreas.map((skill: string, i: number) => (
                            <span key={i} className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {invitation.message && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic">
                        "{invitation.message}"
                      </p>
                    )}
                    {invitation.status === 'PENDING' && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => handleRespond(invitation.id, "ACCEPTED")}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          intent="secondary"
                          onClick={() => handleRespond(invitation.id, "DECLINED")}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      {new Date(invitation.createdAt).toLocaleDateString()}
                    </p>
                  </EnterpriseCardContent>
                </EnterpriseCard>
              ))}
            </div>
          ) : (
            <EnterpriseCard variant="glass">
              <EnterpriseCardContent className="p-12 text-center">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No received invitations</p>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}
        </div>

        {/* Sent Invitations */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sent Invitations ({sentInvitations.length})
          </h2>
          {sentInvitations.length > 0 ? (
            <div className="space-y-4">
              {sentInvitations.map((invitation) => (
                <EnterpriseCard key={invitation.id} variant="default" hover>
                  <EnterpriseCardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(invitation.status)}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {invitation.invitedInstitution?.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {invitation.invitedInstitution?.type}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        invitation.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                        invitation.status === 'DECLINED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        invitation.status === 'EXPIRED' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {invitation.status}
                      </span>
                    </div>
                    {invitation.project && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Project: {invitation.project.title}
                      </p>
                    )}
                    {invitation.quotaAllocated && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Quota: {invitation.quotaAllocated} participants
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      Sent: {new Date(invitation.createdAt).toLocaleDateString()}
                      {invitation.respondedAt && (
                        <span className="ml-2">
                          • Responded: {new Date(invitation.respondedAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </EnterpriseCardContent>
                </EnterpriseCard>
              ))}
            </div>
          ) : (
            <EnterpriseCard variant="glass">
              <EnterpriseCardContent className="p-12 text-center">
                <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No sent invitations</p>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}
        </div>
      </div>
    </main>
  );
}

export default function Invitations() {
  return (
    <ProtectedRoute>
      <InvitationsPage />
    </ProtectedRoute>
  );
}

