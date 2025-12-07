"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "components/Card/Card";
import { DataTable } from "components/Table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "components/Button/Button";
import { Plus, FolderKanban, Users, FileText, Calendar, Search, Filter, MoreVertical, Eye, Edit, Trash2, UserPlus } from "lucide-react";
import { useAuth } from "lib/auth/useAuth";
import { AlertDialog } from "components/ui/alert-dialog";
import { ConfirmDialog } from "components/ui/confirm-dialog";

type Project = {
  id: string;
  title: string;
  summary: string;
  status: string;
  institution: { id: string; name: string };
  owner: { id: string; email: string; fullName: string };
  participants: Array<{ id: string; user: { id: string; email: string; fullName: string }; role: string; status: string }>;
  _count: { milestones: number; documents: number; participants: number };
  createdAt: string;
  updatedAt: string;
};

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/projects`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading) {
      loadProjects();
    }
  }, [apiBase, authLoading]);

  const filteredProjects = useMemo(() => {
    let filtered = projects;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.summary.toLowerCase().includes(query) ||
          p.institution?.name.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    return filtered;
  }, [projects, searchQuery, statusFilter]);

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    ARCHIVED: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  };

  const columns: ColumnDef<Project, any>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.original.title}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{row.original.summary.substring(0, 60)}...</div>
        </div>
      ),
    },
    {
      accessorKey: "institution",
      header: "Institution",
      cell: ({ row }) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">{row.original.institution?.name || "—"}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[status] || statusColors.DRAFT}`}>
            {status}
          </span>
        );
      },
    },
    {
      id: "stats",
      header: "Stats",
      cell: ({ row }) => {
        const counts = row.original._count;
        return (
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {counts?.participants || 0}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {counts?.milestones || 0}
            </span>
            <span className="flex items-center gap-1">
              <FileText size={12} />
              {counts?.documents || 0}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const project = row.original;
        const isOwner = project.owner.id === user?.id;
        const canEdit = isOwner || user?.role === "ADMIN" || user?.role === "INSTITUTION_ADMIN";

        return (
          <div className="flex items-center gap-2">
            <Button href={`/projects/${project.id}`} size="sm" intent="secondary" title="View project">
              <Eye size={14} />
            </Button>
            {canEdit && (
              <Button href={`/projects/${project.id}/edit`} size="sm" intent="secondary" title="Edit project">
                <Edit size={14} />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === "ACTIVE").length;
    const draft = projects.filter((p) => p.status === "DRAFT").length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;
    return { total, active, draft, completed };
  }, [projects]);

  if (authLoading) {
    return (
      <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
        <div className="text-center py-12">Loading...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="title-lg tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="h-6 w-6" />
            Projects
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your collaborative projects and track progress
          </p>
        </div>
        <Button href="/projects/new" intent="primary">
          <Plus size={16} className="mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Projects" value={String(stats.total)} icon={<FolderKanban className="h-5 w-5" />} />
        <StatCard label="Active" value={String(stats.active)} icon={<FolderKanban className="h-5 w-5 text-emerald-500" />} />
        <StatCard label="Draft" value={String(stats.draft)} icon={<FolderKanban className="h-5 w-5 text-gray-500" />} />
        <StatCard label="Completed" value={String(stats.completed)} icon={<FolderKanban className="h-5 w-5 text-blue-500" />} />
      </div>

      {/* Filters */}
      <Card className="hover-pop glass">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects…"
                className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="all">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <Button onClick={loadProjects} size="sm" intent="secondary">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card className="hover-pop glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Projects ({filteredProjects.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredProjects}
            columns={columns}
            placeholder="Filter projects…"
            viewKey="projects-list"
            isLoading={loading}
            emptyMessage="No projects found. Create your first project to get started."
          />
        </CardContent>
      </Card>

      {/* Alert Dialog */}
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
