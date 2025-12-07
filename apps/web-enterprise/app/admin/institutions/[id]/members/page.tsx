"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect, useMemo, useState} from "react";
import {useParams} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "components/Card/Card";
import {DataTable} from "components/Table/DataTable";
import {ColumnDef} from "@tanstack/react-table";
import {Role} from "./types";
import {getToken} from "components/auth/clientStorage";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Row = { id: string; email: string; fullName: string; role: string; status: string };

export default function MembersPage() {
  const params = useParams<{id: string}>();
  const institutionId = params?.id as string;
  const [rows, setRows] = useState<Row[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("RESEARCHER");
  const token = useMemo(() => getToken(), []);

  useEffect(() => {
    if (!institutionId || typeof window === 'undefined') return;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";
    fetch(`${base}/institutions/${institutionId}/memberships`, {
      headers: token ? {Authorization: `Bearer ${token}`} : undefined
    , credentials: "include"}).then(r => r.ok ? r.json() : []).then((list) => {
      const rowsData = Array.isArray(list) ? list : [];
      setRows(rowsData.map((m: any) => ({
        id: m.id, email: m.user?.email, fullName: m.user?.fullName, role: m.role, status: m.status
      })));
    }).catch(() => setRows([]));
  }, [institutionId, token]);

  async function updateRole(membershipId: string, newRole: Role) {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";
      await fetch(`${base}/memberships/${membershipId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? {Authorization: `Bearer ${token}`} : {})
        },
        credentials: "include",
        body: JSON.stringify({role: newRole})
      });
      setRows(prev => prev.map(r => r.id === membershipId ? {...r, role: newRole} : r));
    } catch {
      alert("Role update failed");
    }
  }

  async function removeMember(membershipId: string) {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";
      await fetch(`${base}/memberships/${membershipId}`, {
        method: "DELETE",
        headers: token ? {Authorization: `Bearer ${token}`} : undefined,
        credentials: "include"
      });
      setRows(prev => prev.filter(r => r.id !== membershipId));
    } catch {
      alert("Remove failed");
    }
  }

  const columns: ColumnDef<Row, any>[] = [
    {accessorKey: "fullName", header: "Name"},
    {accessorKey: "email", header: "Email"},
    {
      accessorKey: "role",
      header: "Role",
      cell: ({row}) => (
        <select
          defaultValue={row.original.role}
          className="rounded border px-2 py-1 text-xs"
          onChange={e => updateRole(row.original.id, e.target.value as Role)}
        >
          <option value="RESEARCHER">RESEARCHER</option>
          <option value="REVIEWER">REVIEWER</option>
          <option value="INSTITUTION_ADMIN">INSTITUTION_ADMIN</option>
          <option value="COMPANY_USER">COMPANY_USER</option>
          <option value="STUDENT">STUDENT</option>
        </select>
      )
    },
    {accessorKey: "status", header: "Status"},
    {
      id: "actions",
      header: "Actions",
      cell: ({row}) => (
        <button onClick={() => removeMember(row.original.id)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">
          Remove
        </button>
      )
    }
  ];

  async function invite() {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";
      const res = await fetch(`${base}/institutions/${institutionId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? {Authorization: `Bearer ${token}`} : {})
        },
        credentials: "include",
        body: JSON.stringify({email, role})
      });
      if (!res.ok) throw new Error(await res.text());
      const ms = await res.json();
      setRows(prev => [{id: ms.id, email, fullName: "", role: ms.role, status: ms.status}, ...prev]);
      setEmail("");
      setRole("RESEARCHER");
    } catch (e) {
      alert("Invite failed");
    }
  }

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      <h1 className="title-lg tracking-tight text-gray-900 dark:text-white">Members</h1>
      <Card className="hover-pop glass">
        <CardHeader><CardTitle>Invite member</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1 block text-sm">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} className="rounded border px-3 py-1.5 text-sm" placeholder="user@example.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm">Role</label>
              <select value={role} onChange={e => setRole(e.target.value as Role)} className="rounded border px-3 py-1.5 text-sm">
                <option value="RESEARCHER">RESEARCHER</option>
                <option value="REVIEWER">REVIEWER</option>
                <option value="INSTITUTION_ADMIN">INSTITUTION_ADMIN</option>
                <option value="COMPANY_USER">COMPANY_USER</option>
                <option value="STUDENT">STUDENT</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={invite} className="rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-700">Send Invite</button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="hover-pop glass">
        <CardHeader><CardTitle>All members</CardTitle></CardHeader>
        <CardContent>
          <DataTable data={rows} columns={columns} placeholder="Filter members…" />
        </CardContent>
      </Card>
    </main>
  );
}

