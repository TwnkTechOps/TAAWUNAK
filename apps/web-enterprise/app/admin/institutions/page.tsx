"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import {Card, CardContent, CardHeader, CardTitle} from "components/Card/Card";
import {DataTable} from "components/Table/DataTable";
import {ColumnDef} from "@tanstack/react-table";
import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import { AdminNav } from "components/Nav/AdminNav";

type Row = { id: string; name: string; type: string; verified: boolean };

export default function AdminInstitutionsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("UNIVERSITY");
  const router = useRouter();
  useEffect(() => {
    async function load() {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";
        const res = await fetch(`${base}/institutions`, {
          credentials: "include"
        });
        if (!res.ok) {
          setRows([]);
          return;
        }
        const list = await res.json();
        const institutionsArray = Array.isArray(list) ? list : [];
        setRows(institutionsArray.map((i: any) => ({ 
          id: i.id, 
          name: i.name || "Unknown", 
          type: i.type || "UNKNOWN", 
          verified: !!i.verified 
        })));
      } catch (error) {
        console.error("Failed to load institutions:", error);
        setRows([]);
      }
    }
    load();
  }, []);

  async function createInstitution() {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";
      const res = await fetch(`${base}/institutions`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({name, type})
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to create institution");
      }
      const created = await res.json();
      setRows(prev => [{id: created.id, name: created.name, type: created.type, verified: !!created.verified}, ...prev]);
      setCreating(false);
      setName("");
      setType("UNIVERSITY");
    } catch (e: any) {
      alert(e?.message || "Failed to create institution");
    }
  }

  async function verifyInstitution(id: string) {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";
      const res = await fetch(`${base}/institutions/${id}/verify`, {
        method: "PATCH",
        credentials: "include"
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to verify institution");
      }
      setRows(prev => prev.map(r => r.id === id ? {...r, verified: true} : r));
    } catch (e: any) {
      alert(e?.message || "Verification failed");
    }
  }

  const columns: ColumnDef<Row, any>[] = useMemo(() => [
    {accessorKey: "name", header: "Name"},
    {accessorKey: "type", header: "Type"},
    {accessorKey: "verified", header: "Verified", cell: ({getValue}) => (getValue() ? "Yes" : "No")},
    {
      id: "actions",
      header: "",
      cell: ({row}) => (
        <div className="flex items-center gap-3">
          {!row.original.verified && (
            <button
              onClick={() => verifyInstitution(row.original.id)}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            >
              Verify
            </button>
          )}
          <Link href={`/admin/institutions/${row.original.id}/members`} className="text-emerald-700 hover:underline">
            Members
          </Link>
        </div>
      )
    }
  ], [rows]);

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      <AdminNav />
      <h1 className="title-lg tracking-tight text-gray-900 dark:text-white">Institutions</h1>
      <Card className="hover-pop glass">
        <CardHeader><CardTitle>Create institution</CardTitle></CardHeader>
        <CardContent>
          {!creating ? (
            <button onClick={() => setCreating(true)} className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700">
              New Institution
            </button>
          ) : (
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="mb-1 block text-sm">Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="rounded border px-3 py-1.5 text-sm" placeholder="Institution name" />
              </div>
              <div>
                <label className="mb-1 block text-sm">Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className="rounded border px-3 py-1.5 text-sm">
                  <option value="UNIVERSITY">UNIVERSITY</option>
                  <option value="RESEARCH_CENTER">RESEARCH_CENTER</option>
                  <option value="SCHOOL">SCHOOL</option>
                  <option value="COMPANY">COMPANY</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={createInstitution} className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700">
                  Save
                </button>
                <button onClick={() => setCreating(false)} className="rounded border px-3 py-1.5 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="hover-pop glass">
        <CardHeader><CardTitle>All institutions</CardTitle></CardHeader>
        <CardContent>
          <DataTable data={rows} columns={columns} placeholder="Filter institutions…" />
        </CardContent>
      </Card>
    </main>
  );
}

