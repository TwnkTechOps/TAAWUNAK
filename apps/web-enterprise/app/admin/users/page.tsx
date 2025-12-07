"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/Card/Card";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "components/Table/DataTable";
import { AdminNav } from "components/Nav/AdminNav";
import { Button } from "components/Button/Button";
import { ConfirmDialog } from "components/ui/confirm-dialog";
import { AlertDialog } from "components/ui/alert-dialog";
import { Users, Search, UserPlus, Shield, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";

type Row = { id: string; email: string; fullName: string; role: string; mfaEnabled: boolean; createdAt?: string };

export default function AdminUsersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteFinalConfirmOpen, setDeleteFinalConfirmOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [userToDelete, setUserToDelete] = useState<{id: string; email: string} | null>(null);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  const roleColors: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    INSTITUTION_ADMIN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    RESEARCHER: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    REVIEWER: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    COMPANY_USER: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    STUDENT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };

  const columns: ColumnDef<Row, any>[] = [
    { 
      accessorKey: "email", 
      header: "Email",
      cell: ({ getValue }) => (
        <div className="font-medium text-gray-900 dark:text-white">{getValue() as string}</div>
      )
    },
    { 
      accessorKey: "fullName", 
      header: "Name",
      cell: ({ getValue }) => (
        <div className="text-gray-700 dark:text-gray-300">{getValue() as string || "—"}</div>
      )
    },
    {
      accessorKey: "role", 
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <div className="flex items-center gap-2">
            <select
              value={role}
              className={`rounded-md border-0 px-2 py-1 text-xs font-medium ${roleColors[role] || roleColors.STUDENT}`}
              onChange={(e) => updateRole(row.original.id, e.target.value)}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="INSTITUTION_ADMIN">INSTITUTION_ADMIN</option>
              <option value="RESEARCHER">RESEARCHER</option>
              <option value="REVIEWER">REVIEWER</option>
              <option value="COMPANY_USER">COMPANY_USER</option>
              <option value="STUDENT">STUDENT</option>
            </select>
          </div>
        );
      }
    },
    { 
      accessorKey: "mfaEnabled", 
      header: "MFA", 
      cell: ({ getValue }) => (
        getValue() ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
            <CheckCircle2 size={12} />
            Enabled
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )
      )
    },
    {
      id: "status", 
      header: "Status",
      cell: ({ row }) => {
        const isSuspended = (row.original as any).suspended;
        return isSuspended ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertCircle size={12} />
            Suspended
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
            <CheckCircle2 size={12} />
            Active
          </span>
        );
      }
    },
    {
      id: "actions", 
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => resetMfa(row.original.id)} 
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Reset MFA"
          >
            Reset MFA
          </button>
          <button 
            onClick={() => toggleSuspend(row.original.id)} 
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Suspend/Restore"
          >
            {(row.original as any).suspended ? "Restore" : "Suspend"}
          </button>
          <button 
            onClick={() => revokeSessions(row.original.id)} 
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-gray-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
            title="Revoke all sessions"
          >
            Revoke Sessions
          </button>
          <button 
            onClick={() => {
              setUserToDelete({id: row.original.id, email: row.original.email});
              setDeleteConfirmOpen(true);
            }} 
            className="rounded-md border border-red-300 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20 flex items-center gap-1"
            title="Delete user permanently"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      )
    },
    { 
      accessorKey: "createdAt", 
      header: "Created",
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return date ? new Date(date).toLocaleDateString() : "—";
      }
    }
  ];

  async function refresh() {
    const url = new URL(`${apiBase}/users`);
    if (q) url.searchParams.set("q", q);
    const res = await fetch(url.toString(), {
      credentials: "include"
    });
    if (!res.ok) {
      setRows([]);
      return;
    }
    const list = await res.json();
    const usersArray = Array.isArray(list) ? list : [];
    setRows(usersArray.map((u: any) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      mfaEnabled: u.mfaEnabled || false,
      suspended: u.suspended || false,
      createdAt: u.createdAt
    })));
  }

  async function updateRole(id: string, role: string) {
    try {
      const res = await fetch(`${apiBase}/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        refresh();
      } else {
        alert("Failed to update user role");
      }
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update user role");
    }
  }

  async function resetMfa(id: string) {
    try {
      const res = await fetch(`${apiBase}/users/${id}/reset-mfa`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        refresh();
      } else {
        alert("Failed to reset MFA");
      }
    } catch (error) {
      console.error("Failed to reset MFA:", error);
      alert("Failed to reset MFA");
    }
  }

  async function toggleSuspend(id: string) {
    try {
      const res = await fetch(`${apiBase}/users/${id}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ suspended: true })
      });
      if (res.ok) {
        refresh();
      } else {
        alert("Failed to suspend user");
      }
    } catch (error) {
      console.error("Failed to suspend user:", error);
      alert("Failed to suspend user");
    }
  }

  async function revokeSessions(id: string) {
    try {
      const res = await fetch(`${apiBase}/users/${id}/revoke-sessions`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        refresh();
      } else {
        alert("Failed to revoke sessions");
      }
    } catch (error) {
      console.error("Failed to revoke sessions:", error);
      alert("Failed to revoke sessions");
    }
  }

  async function handleDeleteConfirm() {
    setDeleteConfirmOpen(false);
    setDeleteFinalConfirmOpen(true);
  }

  async function handleFinalDelete() {
    if (!userToDelete) return;
    
    setDeleteFinalConfirmOpen(false);
    
    try {
      const res = await fetch(`${apiBase}/users/${userToDelete.id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (res.ok) {
        const result = await res.json();
        setAlertType("success");
        setAlertTitle("User Deleted Successfully");
        setAlertMessage(`User "${userToDelete.email}" has been permanently deleted.`);
        setAlertOpen(true);
        setUserToDelete(null);
        refresh();
      } else {
        let errorMessage = "Unknown error";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
        } catch {
          const errorText = await res.text();
          errorMessage = errorText || "Unknown error";
        }
        
        setAlertType("error");
        setAlertTitle("Failed to Delete User");
        setAlertMessage(errorMessage);
        setAlertOpen(true);
        console.error("Delete user error:", errorMessage);
      }
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      setAlertType("error");
      setAlertTitle("Network Error");
      setAlertMessage(error?.message || "Network error. Please check your connection and try again.");
      setAlertOpen(true);
    }
  }

  useEffect(() => { refresh(); }, [apiBase]);

  const totalUsers = rows.length;
  const activeUsers = rows.filter(r => !(r as any).suspended).length;
  const admins = rows.filter(r => r.role === "ADMIN").length;
  const mfaEnabled = rows.filter(r => r.mfaEnabled).length;

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      <AdminNav />
      
      {/* Header with Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="title-lg tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage user accounts, roles, and access permissions
          </p>
        </div>
        <Button href="/auth/register" intent="primary">
          <UserPlus size={16} className="mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={String(totalUsers)} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Active Users" value={String(activeUsers)} icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} />
        <StatCard label="Administrators" value={String(admins)} icon={<Shield className="h-5 w-5 text-purple-500" />} />
        <StatCard label="MFA Enabled" value={String(mfaEnabled)} icon={<Shield className="h-5 w-5 text-blue-500" />} />
      </div>

      {/* Search Bar */}
      <Card className="hover-pop glass">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && refresh()}
                placeholder="Search by email or name…"
                className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <Button onClick={refresh} intent="primary">
              <Search size={16} className="mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="hover-pop glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users ({totalUsers})</CardTitle>
            <Button onClick={refresh} size="sm" intent="secondary">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable data={rows} columns={columns} placeholder="Filter users…" viewKey="admin-users" />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialogs */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        type="warning"
        title="⚠️ WARNING: Permanent Deletion"
        message={
          userToDelete
            ? `Are you sure you want to permanently delete user "${userToDelete.email}"?\n\n` +
              `This action CANNOT be undone. The following will be deleted:\n` +
              `• User account and profile\n` +
              `• All memberships and institution associations\n` +
              `• All credentials and verifications\n` +
              `• All audit events and activity logs\n` +
              `• All sessions and devices\n\n` +
              `Click "Continue" to proceed with deletion.`
            : ""
        }
        confirmText="Continue"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setUserToDelete(null);
        }}
      />

      <ConfirmDialog
        open={deleteFinalConfirmOpen}
        type="error"
        title="🔴 FINAL CONFIRMATION"
        message={
          userToDelete
            ? `You are about to PERMANENTLY DELETE user "${userToDelete.email}".\n\n` +
              `This is your last chance to cancel.\n\n` +
              `This action cannot be reversed.`
            : ""
        }
        confirmText="Delete Permanently"
        cancelText="Cancel"
        onConfirm={handleFinalDelete}
        onCancel={() => {
          setDeleteFinalConfirmOpen(false);
          setUserToDelete(null);
        }}
      />

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


