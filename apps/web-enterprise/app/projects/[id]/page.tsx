"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "components/Card/Card";
import { Button } from "components/Button/Button";
import { ArrowLeft, FolderKanban, Calendar, Users, FileText, Plus, CheckCircle2, Clock, AlertCircle, MoreVertical, X, Check, Archive, RotateCcw, AlertTriangle } from "lucide-react";
import { useAuth } from "lib/auth/useAuth";
import { AlertDialog } from "components/ui/alert-dialog";
import { RiskAlerts } from "./risk-alerts";
import { ArchiveButton, RestoreButton } from "./archive-buttons";
import { CommunicationTab } from "./communication-tab";

type Project = {
  id: string;
  title: string;
  summary: string;
  description?: string;
  status: string;
  institution: { id: string; name: string };
  owner: { id: string; email: string; fullName: string };
  participants: Array<{ id: string; user: { id: string; email: string; fullName: string }; role: string; status: string }>;
  milestones: Array<{
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    status: string;
    tasks: Array<{
      id: string;
      title: string;
      status: string;
      assignedTo?: string;
      assignee?: { id: string; email: string; fullName: string };
      dueDate?: string;
    }>;
  }>;
  documents: Array<{
    id: string;
    name: string;
    contentType: string;
    size?: number;
    createdBy: { id: string; email: string; fullName: string };
    createdAt: string;
  }>;
  _count: { milestones: number; documents: number; participants: number; proposals: number };
  createdAt: string;
};

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "milestones" | "documents" | "participants" | "communication">("overview");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId, apiBase]);

  async function loadProject() {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/projects/${projectId}`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      } else {
        setAlertType("error");
        setAlertTitle("Error");
        setAlertMessage("Failed to load project. You may not have access.");
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("Failed to load project:", error);
      setAlertType("error");
      setAlertTitle("Network Error");
      setAlertMessage("Failed to load project. Please check your connection.");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    ARCHIVED: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  };

  const isOwner = project?.owner.id === user?.id;
  const canEdit = isOwner || user?.role === "ADMIN" || user?.role === "INSTITUTION_ADMIN";

  if (loading) {
    return (
      <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
        <div className="text-center py-12">Loading project...</div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Project not found or you don't have access.</p>
          <Button href="/projects" className="mt-4" intent="secondary">
            <ArrowLeft size={16} className="mr-2" />
            Back to Projects
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button href="/projects" size="sm" intent="secondary">
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="title-lg tracking-tight text-gray-900 dark:text-white">{project.title}</h1>
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[project.status] || statusColors.DRAFT}`}>
              {project.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{project.summary}</p>
        </div>
        <div className="flex gap-2">
          {canEdit && project.status !== "ARCHIVED" && (
            <>
              <Button href={`/projects/${projectId}/edit`} size="sm" intent="primary">
                Edit Project
              </Button>
              <ArchiveButton projectId={projectId} onArchive={loadProject} />
            </>
          )}
          {user?.role === "ADMIN" && project.status === "ARCHIVED" && (
            <RestoreButton projectId={projectId} onRestore={loadProject} />
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Milestones" value={String(project._count.milestones)} icon={<Calendar className="h-5 w-5" />} />
        <StatCard label="Documents" value={String(project._count.documents)} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Participants" value={String(project._count.participants)} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Proposals" value={String(project._count.proposals)} icon={<FileText className="h-5 w-5" />} />
      </div>

      {/* Risk Alerts */}
      <RiskAlerts projectId={projectId} />

      {/* Tabs */}
      <Card className="hover-pop glass">
        <CardHeader>
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-brand text-brand"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("milestones")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "milestones"
                  ? "border-brand text-brand"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Milestones & Tasks
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "documents"
                  ? "border-brand text-brand"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "participants"
                  ? "border-brand text-brand"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Participants
            </button>
            <button
              onClick={() => setActiveTab("communication")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "communication"
                  ? "border-brand text-brand"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Communication
            </button>
            <Link href={`/projects/${projectId}/report`}>
              <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Report
              </button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {activeTab === "overview" && <OverviewTab project={project} />}
          {activeTab === "milestones" && <MilestonesTab projectId={projectId} milestones={project.milestones} canEdit={canEdit} onRefresh={loadProject} />}
          {activeTab === "documents" && <DocumentsTab projectId={projectId} documents={project.documents} canEdit={canEdit} onRefresh={loadProject} />}
          {activeTab === "participants" && <ParticipantsTab projectId={projectId} participants={project.participants} owner={project.owner} canEdit={canEdit} onRefresh={loadProject} />}
          {activeTab === "communication" && <CommunicationTab projectId={projectId} canEdit={canEdit} />}
        </CardContent>
      </Card>

      <AlertDialog
        open={alertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
    </main>
  );
}

function OverviewTab({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{project.description || project.summary}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Institution</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{project.institution.name}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Owner</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{project.owner.fullName} ({project.owner.email})</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Created</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(project.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}

function MilestonesTab({ projectId, milestones, canEdit, onRefresh }: { projectId: string; milestones: any[]; canEdit: boolean; onRefresh: () => void }) {
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  async function createMilestone(data: { title: string; description?: string; dueDate?: string }) {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/projects/${projectId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setAlertType("success");
        setAlertTitle("Success");
        setAlertMessage("Milestone created successfully!");
        setAlertOpen(true);
        setMilestoneDialogOpen(false);
        onRefresh();
      } else {
        const error = await res.json().catch(() => ({ message: "Failed to create milestone" }));
        setAlertType("error");
        setAlertTitle("Error");
        setAlertMessage(error.message || "Failed to create milestone");
        setAlertOpen(true);
      }
    } catch (error: any) {
      setAlertType("error");
      setAlertTitle("Network Error");
      setAlertMessage(error?.message || "Network error. Please try again.");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  }

  async function createTask(milestoneId: string, data: { title: string; description?: string; assignedTo?: string; dueDate?: string }) {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/projects/${projectId}/milestones/${milestoneId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setAlertType("success");
        setAlertTitle("Success");
        setAlertMessage("Task created successfully!");
        setAlertOpen(true);
        setTaskDialogOpen(false);
        setSelectedMilestone(null);
        onRefresh();
      } else {
        const error = await res.json().catch(() => ({ message: "Failed to create task" }));
        setAlertType("error");
        setAlertTitle("Error");
        setAlertMessage(error.message || "Failed to create task");
        setAlertOpen(true);
      }
    } catch (error: any) {
      setAlertType("error");
      setAlertTitle("Network Error");
      setAlertMessage(error?.message || "Network error. Please try again.");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <Button intent="primary" size="sm" onClick={() => setMilestoneDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Milestone
        </Button>
      )}
      {milestones.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No milestones yet. {canEdit && "Create your first milestone to get started."}</p>
      ) : (
        milestones.map((milestone) => (
          <Card key={milestone.id} className="hover-pop">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{milestone.title}</CardTitle>
                  {milestone.description && <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>}
                  {milestone.dueDate && (
                    <p className="text-xs text-gray-400 mt-1">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded ${milestone.status === "DONE" ? "bg-emerald-100 text-emerald-800" : milestone.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                  {milestone.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tasks</h4>
                {canEdit && (
                  <Button
                    size="sm"
                    intent="secondary"
                    onClick={() => {
                      setSelectedMilestone(milestone.id);
                      setTaskDialogOpen(true);
                    }}
                  >
                    <Plus size={14} className="mr-1" />
                    Add Task
                  </Button>
                )}
              </div>
              {milestone.tasks && milestone.tasks.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {milestone.tasks.map((task: any) => (
                    <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      {task.status === "COMPLETED" ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <Clock size={16} className="text-gray-400" />
                      )}
                      <span className="text-sm flex-1">{task.title}</span>
                      {task.assignee && <span className="text-xs text-gray-500">@{task.assignee.fullName}</span>}
                      {task.dueDate && (
                        <span className="text-xs text-gray-400">{new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tasks yet</p>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {/* Create Milestone Dialog */}
      <MilestoneDialog
        open={milestoneDialogOpen}
        onClose={() => setMilestoneDialogOpen(false)}
        onSubmit={createMilestone}
        loading={loading}
      />

      {/* Create Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false);
          setSelectedMilestone(null);
        }}
        onSubmit={(data) => selectedMilestone && createTask(selectedMilestone, data)}
        loading={loading}
      />

      <AlertDialog
        open={alertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}

function DocumentsTab({ projectId, documents, canEdit, onRefresh }: { projectId: string; documents: any[]; canEdit: boolean; onRefresh: () => void }) {
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  async function handleFileUpload(file: File) {
    setUploading(true);
    try {
      // Get presigned URL
      const urlRes = await fetch(
        `${apiBase}/projects/${projectId}/documents/upload-url?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`,
        { credentials: "include" }
      );
      if (!urlRes.ok) throw new Error("Failed to get upload URL");

      const { url, key } = await urlRes.json();

      // Upload to S3
      const uploadRes = await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) throw new Error("Failed to upload file");

      // Create document record
      const docRes = await fetch(`${apiBase}/projects/${projectId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: file.name,
          s3Key: key,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (docRes.ok) {
        setAlertType("success");
        setAlertTitle("Success");
        setAlertMessage("Document uploaded successfully!");
        setAlertOpen(true);
        setUploadDialogOpen(false);
        onRefresh();
      } else {
        throw new Error("Failed to create document record");
      }
    } catch (error: any) {
      setAlertType("error");
      setAlertTitle("Upload Error");
      setAlertMessage(error?.message || "Failed to upload document. Please try again.");
      setAlertOpen(true);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <Button intent="primary" size="sm" onClick={() => setUploadDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          Upload Document
        </Button>
      )}
      {documents.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No documents yet. {canEdit && "Upload your first document to get started."}</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-gray-400" />
                <div>
                  <div className="text-sm font-medium">{doc.name}</div>
                  <div className="text-xs text-gray-500">
                    {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : ""} • {doc.createdBy.fullName} • {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <Button size="sm" intent="secondary">View</Button>
            </div>
          ))}
        </div>
      )}

      <DocumentUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleFileUpload}
        uploading={uploading}
      />

      <AlertDialog
        open={alertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}

function ParticipantsTab({ projectId, participants, owner, canEdit, onRefresh }: { projectId: string; participants: any[]; owner: any; canEdit: boolean; onRefresh: () => void }) {
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (addDialogOpen) {
      loadUsers();
    }
  }, [addDialogOpen, apiBase]);

  async function loadUsers() {
    try {
      const res = await fetch(`${apiBase}/users`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  }

  async function addParticipant(userId: string, role: string) {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/projects/${projectId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, role }),
      });
      if (res.ok) {
        setAlertType("success");
        setAlertTitle("Success");
        setAlertMessage("Participant added successfully!");
        setAlertOpen(true);
        setAddDialogOpen(false);
        onRefresh();
      } else {
        const error = await res.json().catch(() => ({ message: "Failed to add participant" }));
        setAlertType("error");
        setAlertTitle("Error");
        setAlertMessage(error.message || "Failed to add participant");
        setAlertOpen(true);
      }
    } catch (error: any) {
      setAlertType("error");
      setAlertTitle("Network Error");
      setAlertMessage(error?.message || "Network error. Please try again.");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  }

  async function removeParticipant(userId: string) {
    try {
      const res = await fetch(`${apiBase}/projects/${projectId}/participants/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setAlertType("success");
        setAlertTitle("Success");
        setAlertMessage("Participant removed successfully!");
        setAlertOpen(true);
        onRefresh();
      } else {
        const error = await res.json().catch(() => ({ message: "Failed to remove participant" }));
        setAlertType("error");
        setAlertTitle("Error");
        setAlertMessage(error.message || "Failed to remove participant");
        setAlertOpen(true);
      }
    } catch (error: any) {
      setAlertType("error");
      setAlertTitle("Network Error");
      setAlertMessage(error?.message || "Network error. Please try again.");
      setAlertOpen(true);
    }
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <Button intent="primary" size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Participant
        </Button>
      )}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-gray-400" />
            <div>
              <div className="text-sm font-medium">{owner.fullName}</div>
              <div className="text-xs text-gray-500">{owner.email} • Owner</div>
            </div>
          </div>
        </div>
        {participants.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-gray-400" />
              <div>
                <div className="text-sm font-medium">{p.user.fullName}</div>
                <div className="text-xs text-gray-500">{p.user.email} • {p.role}</div>
              </div>
            </div>
            {canEdit && p.role !== "OWNER" && (
              <Button size="sm" intent="secondary" onClick={() => removeParticipant(p.user.id)}>Remove</Button>
            )}
          </div>
        ))}
      </div>

      <AddParticipantDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={addParticipant}
        users={users}
        loading={loading}
      />

      <AlertDialog
        open={alertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="hover-pop glass">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
          </div>
          <div className="text-gray-400 dark:text-gray-500">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Dialog Components
function MilestoneDialog({
  open,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; dueDate?: string }) => void;
  loading: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setDueDate("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create Milestone</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (title.trim()) {
                onSubmit({ title: title.trim(), description: description.trim() || undefined, dueDate: dueDate || undefined });
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-700 dark:bg-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-700 dark:bg-gray-800"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" intent="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" intent="primary" disabled={loading || !title.trim()}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function TaskDialog({
  open,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; assignedTo?: string; dueDate?: string }) => void;
  loading: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setDueDate("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create Task</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (title.trim()) {
                onSubmit({ title: title.trim(), description: description.trim() || undefined, dueDate: dueDate || undefined });
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-700 dark:bg-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-700 dark:bg-gray-800"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" intent="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" intent="primary" disabled={loading || !title.trim()}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function DocumentUploadDialog({
  open,
  onClose,
  onUpload,
  uploading,
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-700 dark:bg-gray-800"
                disabled={uploading}
              />
              {file && (
                <p className="mt-2 text-xs text-gray-500">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" intent="secondary" onClick={onClose} disabled={uploading}>
                Cancel
              </Button>
              <Button
                type="button"
                intent="primary"
                onClick={() => file && onUpload(file)}
                disabled={uploading || !file}
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddParticipantDialog({
  open,
  onClose,
  onSubmit,
  users,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (userId: string, role: string) => void;
  users: any[];
  loading: boolean;
}) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("COLLABORATOR");

  useEffect(() => {
    if (!open) {
      setUserId("");
      setRole("COLLABORATOR");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add Participant</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (userId) {
                onSubmit(userId, role);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">User *</label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-700 dark:bg-gray-800"
                required
              >
                <option value="">Select a user</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName || u.email} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-700 dark:bg-gray-800"
                required
              >
                <option value="COLLABORATOR">Collaborator</option>
                <option value="REVIEWER">Reviewer</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" intent="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" intent="primary" disabled={loading || !userId}>
                {loading ? "Adding..." : "Add"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

