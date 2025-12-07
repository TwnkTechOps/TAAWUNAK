"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect, useMemo, useState} from "react";
import {useParams} from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import {Card, CardContent, CardHeader, CardTitle} from "components/Card/Card";
import {DataTable} from "components/Table/DataTable";
import {ColumnDef} from "@tanstack/react-table";
import {getToken} from "components/auth/clientStorage";

type Row = { ts: string; actor?: string; action: string; details?: string };

export default function InstitutionAuditPage() {
  const params = useParams<{id: string}>();
  const institutionId = params?.id as string;
  const [rows, setRows] = useState<Row[]>([]);
  const token = useMemo(() => getToken(), []);
  const [apiBase] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312");

  const columns: ColumnDef<Row, any>[] = [
    {accessorKey: "ts", header: "Time"},
    {accessorKey: "actor", header: "Actor"},
    {accessorKey: "action", header: "Action"},
    {accessorKey: "details", header: "Details"}
  ];

  useEffect(() => {
    if (!institutionId) return;
    fetch(`${apiBase}/audit/events`, {
      headers: token ? {Authorization: `Bearer ${token}`} : undefined
    })
      .then(r => r.json())
      .then((list) => {
        const filtered = (list || []).filter((e: any) => e.targetId === institutionId);
        setRows(filtered.map((e: any) => ({
          ts: e.createdAt,
          actor: e.actor?.email,
          action: e.action,
          details: e.metadata ? JSON.stringify(e.metadata) : ""
        })));
      })
      .catch(() => setRows([]));
  }, [institutionId, apiBase, token]);

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      <h1 className="title-lg tracking-tight text-gray-900 dark:text-white">Institution Audit</h1>
      <Card className="hover-pop glass">
        <CardHeader><CardTitle>Events</CardTitle></CardHeader>
        <CardContent>
          <DataTable data={rows} columns={columns} placeholder="Filter events…" />
        </CardContent>
      </Card>
    </main>
  );
}


