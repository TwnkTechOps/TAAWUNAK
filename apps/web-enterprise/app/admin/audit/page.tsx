"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect, useMemo, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "components/Card/Card";
import {DataTable} from "components/Table/DataTable";
import {ColumnDef} from "@tanstack/react-table";
import {getToken} from "components/auth/clientStorage";
import { AdminNav } from "components/Nav/AdminNav";

type Row = { id: string; ts: string; actorEmail?: string; action: string; resource?: string; ip?: string; details?: string };

export default function AuditPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const token = useMemo(() => getToken(), []);
  const columns: ColumnDef<Row, any>[] = [
    {accessorKey: "ts", header: "Time"},
    {accessorKey: "actorEmail", header: "Actor"},
    {accessorKey: "action", header: "Action"},
    {accessorKey: "resource", header: "Resource"},
    {accessorKey: "ip", header: "IP"},
    {accessorKey: "details", header: "Details"}
  ];

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";
    fetch(`${base}/audit/events`, {
      headers: token ? {Authorization: `Bearer ${token}`} : undefined
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(list => {
        setRows((list || []).map((e: any) => ({
          id: e.id || crypto.randomUUID(),
          ts: e.createdAt || e.timestamp || "",
          actorEmail: e.actor?.email || e.actorEmail,
          action: e.action,
          resource: e.resource,
          ip: e.ip,
          details: e.details ? JSON.stringify(e.details) : ""
        })));
      })
      .catch(() => {
        // fallback demo data
        setRows([
          {id: "1", ts: new Date().toISOString(), actorEmail: "admin@example.com", action: "LOGIN_SUCCESS", resource: "-", ip: "127.0.0.1", details: "{}"},
          {id: "2", ts: new Date().toISOString(), actorEmail: "uni-admin@ksu.edu.sa", action: "INSTITUTION_VERIFY", resource: "KSU", ip: "127.0.0.1", details: '{"verified":true}'}
        ]);
      });
  }, [token]);

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      <AdminNav />
      <h1 className="title-lg tracking-tight text-gray-900 dark:text-white">Audit & Activity</h1>
      <Card className="hover-pop glass">
        <CardHeader><CardTitle>Events</CardTitle></CardHeader>
        <CardContent>
          <DataTable data={rows} columns={columns} placeholder="Filter events…" />
        </CardContent>
      </Card>
    </main>
  );
}

