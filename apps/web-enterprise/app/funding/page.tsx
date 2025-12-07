/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, Users, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "components/Card/Card";
import { Button } from "components/Button/Button";
import { DataTable } from "components/Table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { AlertDialog } from "components/ui/alert-dialog";
import { useAuth } from "lib/auth/useAuth";

type FundingCall = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  createdAt: string;
  _count: { applications: number };
};

type Application = {
  id: string;
  fundingCall: FundingCall;
  project: {
    id: string;
    title: string;
    institution: { name: string };
    owner: { fullName: string };
  };
  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  createdAt: string;
};

export default function FundingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [calls, setCalls] = useState<FundingCall[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"calls" | "applications">("calls");
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<FundingCall | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    loadCalls();
    if (user?.role === "ADMIN") {
      loadApplications();
    }
  }, [apiBase, user]);

  async function loadCalls() {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/funding/calls`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setCalls(data);
      }
    } catch (error) {
      console.error("Failed to load funding calls:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadApplications() {
    try {
      // Load all applications for admin view
      const res = await fetch(`${apiBase}/funding/calls`, {
        credentials: "include"
      });
      if (res.ok) {
        const callsData = await res.json();
        const allApps: Application[] = [];
        for (const call of callsData) {
          const callRes = await fetch(`${apiBase}/funding/calls/${call.id}`, {
            credentials: "include"
          });
          if (callRes.ok) {
            const callData = await callRes.json();
            if (callData.applications) {
              allApps.push(...callData.applications);
            }
          }
        }
        setApplications(allApps);
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
    }
  }

  async function loadProjects() {
    try {
      const res = await fetch(`${apiBase}/projects`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  }

  async function createCall(data: { title: string; description: string; deadline: string }) {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/funding/calls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setAlertType("success");
        setAlertTitle("Success");
        setAlertMessage("Funding call created successfully!");
        setAlertOpen(true);
        setCallDialogOpen(false);
        loadCalls();
      } else {
        const error = await res.json().catch(() => ({ message: "Failed to create funding call" }));
        setAlertType("error");
        setAlertTitle("Error");
        setAlertMessage(error.message || "Failed to create funding call");
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

  async function submitApplication(fundingCallId: string, projectId: string) {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/funding/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fundingCallId, projectId }),
      });
      if (res.ok) {
        setAlertType("success");
        setAlertTitle("Success");
        setAlertMessage("Application submitted successfully!");
        setAlertOpen(true);
        setApplyDialogOpen(false);
        loadApplications();
      } else {
        const error = await res.json().catch(() => ({ message: "Failed to submit application" }));
        setAlertType("error");
        setAlertTitle("Error");
        setAlertMessage(error.message || "Failed to submit application");
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

  const statusColors: Record<string, string> = {
    SUBMITTED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    UNDER_REVIEW: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const statusIcons: Record<string, any> = {
    SUBMITTED: Clock,
    UNDER_REVIEW: Clock,
    APPROVED: CheckCircle2,
    REJECTED: XCircle,
  };

  const callColumns: ColumnDef<FundingCall, any>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          <div className="text-xs text-gray-500 line-clamp-2">{row.original.description}</div>
        </div>
      ),
    },
    {
      accessorKey: "deadline",
      header: "Deadline",
      cell: ({ getValue }) => {
        const deadline = new Date(getValue() as string);
        const isPast = deadline < new Date();
        return (
          <div className={`flex items-center gap-1 ${isPast ? "text-red-600" : ""}`}>
            <Calendar size={14} />
            <span>{deadline.toLocaleDateString()}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "_count.applications",
      header: "Applications",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users size={14} />
          <span>{row.original._count?.applications || 0}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const call = row.original;
        const isPast = new Date(call.deadline) < new Date();
        return (
          <Button
            onClick={() => {
              setSelectedCall(call);
              loadProjects();
              setApplyDialogOpen(true);
            }}
            disabled={isPast || user?.role === "ADMIN"}
            className="text-xs"
          >
            Apply
          </Button>
        );
      },
    },
  ];

  const applicationColumns: ColumnDef<Application, any>[] = [
    {
      accessorKey: "project.title",
      header: "Project",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.project.title}</div>
          <div className="text-xs text-gray-500">{row.original.project.institution.name}</div>
        </div>
      ),
    },
    {
      accessorKey: "fundingCall.title",
      header: "Funding Call",
      cell: ({ row }) => row.original.fundingCall.title,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        const Icon = statusIcons[status] || Clock;
        return (
          <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs ${statusColors[status] || ""}`}>
            <Icon size={12} />
            {status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Applied",
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
  ];

  if (loading && calls.length === 0) {
    return (
      <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
        <div className="text-center">Loading...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="title-lg tracking-tight text-gray-900 dark:text-white">Funding</h1>
        {user?.role === "ADMIN" && (
          <Button onClick={() => setCallDialogOpen(true)} className="inline-flex items-center gap-2">
            <Plus size={16} /> Create Funding Call
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab("calls")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "calls"
              ? "border-brand text-brand"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          Funding Calls
        </button>
        {user?.role === "ADMIN" && (
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "applications"
                ? "border-brand text-brand"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Applications
          </button>
        )}
      </div>

      {activeTab === "calls" && (
        <Card className="hover-pop glass">
          <CardHeader><CardTitle>Available Funding Calls</CardTitle></CardHeader>
          <CardContent>
            <DataTable data={calls} columns={callColumns} placeholder="Filter calls…" viewKey="funding-calls" />
          </CardContent>
        </Card>
      )}

      {activeTab === "applications" && user?.role === "ADMIN" && (
        <Card className="hover-pop glass">
          <CardHeader><CardTitle>All Applications</CardTitle></CardHeader>
          <CardContent>
            <DataTable data={applications} columns={applicationColumns} placeholder="Filter applications…" viewKey="applications" />
          </CardContent>
        </Card>
      )}

      {/* Create Funding Call Dialog */}
      {callDialogOpen && (
        <CreateCallDialog
          onClose={() => setCallDialogOpen(false)}
          onSubmit={createCall}
          loading={loading}
        />
      )}

      {/* Apply Dialog */}
      {applyDialogOpen && selectedCall && (
        <ApplyDialog
          call={selectedCall}
          projects={projects}
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
          onClose={() => {
            setApplyDialogOpen(false);
            setSelectedCall(null);
            setSelectedProject("");
          }}
          onSubmit={() => {
            if (selectedProject) {
              submitApplication(selectedCall.id, selectedProject);
            }
          }}
          loading={loading}
        />
      )}

      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
      />
    </main>
  );
}

function CreateCallDialog({ onClose, onSubmit, loading }: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ title, description, deadline });
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-semibold">Create Funding Call</div>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
            <XCircle size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Deadline *</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border px-3 py-1.5 text-sm dark:border-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1 rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function ApplyDialog({ call, projects, selectedProject, onProjectChange, onClose, onSubmit, loading }: any) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold">Apply to Funding Call</div>
            <div className="text-sm text-gray-500">{call.title}</div>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
            <XCircle size={16} />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Select Project *</label>
            <select
              value={selectedProject}
              onChange={(e) => onProjectChange(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              required
            >
              <option value="">Choose a project...</option>
              {projects.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.title} - {project.institution?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border px-3 py-1.5 text-sm dark:border-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedProject}
              className="inline-flex items-center gap-1 rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
