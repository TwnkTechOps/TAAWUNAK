"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect, useMemo, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "components/Card/Card";
import {DataTable} from "components/Table/DataTable";
import {ColumnDef} from "@tanstack/react-table";

type Row = { id: string; user: string; type: string; status: string; createdAt?: string };

export default function AdminCredentialsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  const columns: ColumnDef<Row, any>[] = [
    {accessorKey: "user", header: "User"},
    {accessorKey: "type", header: "Type"},
    {
      accessorKey: "status", header: "Status",
      cell: ({row}) => (
        <select
          defaultValue={row.original.status}
          className="rounded border px-2 py-1 text-xs"
          onChange={e => setStatus(row.original.id, e.target.value as any)}
        >
          <option value="PENDING">PENDING</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      )
    },
    {accessorKey: "createdAt", header: "Created"}
  ];

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/credentials/admin/all`, {
        credentials: "include"
      });
      if (!res.ok) {
        setRows([]);
        return;
      }
      const list = await res.json();
      const credentialsArray = Array.isArray(list) ? list : [];
      setRows(credentialsArray.map((c: any) => ({
        id: c.id,
        user: c.user?.email || c.userEmail || "Unknown",
        type: c.type || "UNKNOWN",
        status: c.status || "PENDING",
        createdAt: c.createdAt || ""
      })));
    } catch (error) {
      console.error("Failed to load credentials:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(id: string, status: 'PENDING'|'VERIFIED'|'REJECTED') {
    try {
      const res = await fetch(`${apiBase}/credentials/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({status})
      });
      if (res.ok) {
        refresh();
      } else {
        alert("Failed to update credential status");
      }
    } catch (error) {
      console.error("Failed to update credential:", error);
      alert("Failed to update credential status");
    }
  }

  useEffect(() => { refresh(); }, [apiBase]);

  const pendingCount = rows.filter(r => r.status === "PENDING").length;
  const verifiedCount = rows.filter(r => r.status === "VERIFIED").length;
  const rejectedCount = rows.filter(r => r.status === "REJECTED").length;

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="title-lg tracking-tight text-gray-900 dark:text-white">Credentials Verification</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Review and verify user credentials and certifications
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="hover-pop glass">
          <CardContent className="py-4">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Pending</div>
            <div className="mt-1 text-2xl font-semibold text-amber-600 dark:text-amber-400">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="hover-pop glass">
          <CardContent className="py-4">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Verified</div>
            <div className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{verifiedCount}</div>
          </CardContent>
        </Card>
        <Card className="hover-pop glass">
          <CardContent className="py-4">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Rejected</div>
            <div className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover-pop glass">
        <CardHeader><CardTitle>All credentials ({rows.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading credentials...</div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No credentials found</div>
          ) : (
            <DataTable data={rows} columns={columns} placeholder="Filter credentials…" viewKey="admin-credentials" />
          )}
        </CardContent>
      </Card>
    </main>
  );
}


