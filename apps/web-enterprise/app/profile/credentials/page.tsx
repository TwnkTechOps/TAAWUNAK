"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect, useMemo, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "components/Card/Card";
import {DataTable} from "components/Table/DataTable";
import {ColumnDef} from "@tanstack/react-table";
import {getToken} from "components/auth/clientStorage";

type Row = { id: string; type: string; status: string; s3Key?: string; link?: string; createdAt?: string };

export default function CredentialsPage() {
  const [apiBase, setApiBase] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312");
  const [rows, setRows] = useState<Row[]>([]);
  const [type, setType] = useState<'ORCID'|'ID_DOC'|'CERT'>('ID_DOC');
  const [file, setFile] = useState<File | null>(null);
  const token = useMemo(() => getToken(), []);

  const columns: ColumnDef<Row, any>[] = [
    {accessorKey: "type", header: "Type"},
    {accessorKey: "status", header: "Status"},
    {accessorKey: "s3Key", header: "File"},
    {accessorKey: "createdAt", header: "Created"}
  ];

  async function refresh() {
    const res = await fetch(`${apiBase}/credentials`, {
      headers: token ? {Authorization: `Bearer ${token}`} : undefined
    });
    if (!res.ok) return setRows([]);
    const list = await res.json();
    setRows(list);
  }

  useEffect(() => { if (token) refresh(); }, [token]);

  async function uploadAndCreate() {
    let s3Key: string | undefined;
    if (file) {
      const key = `credentials/${Date.now()}-${file.name}`;
      const pres = await fetch(`${apiBase}/files/presign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({key, contentType: file.type || "application/octet-stream"})
      }).then(r => r.json());
      const put = await fetch(pres.url, {
        method: "PUT",
        headers: {"Content-Type": file.type || "application/octet-stream"},
        body: file
      });
      if (!put.ok) throw new Error("Upload failed");
      s3Key = pres.key;
    }
    const res = await fetch(`${apiBase}/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      credentials: "include",
      body: JSON.stringify({type, s3Key})
    });
    if (!res.ok) throw new Error(await res.text());
    setFile(null);
    await refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`${apiBase}/credentials/${id}`, {
      method: "DELETE",
      headers: token ? {Authorization: `Bearer ${token}`} : undefined,
      credentials: "include"
    });
    if (res.ok) refresh();
  }

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Credentials</h1>
      <Card>
        <CardHeader><CardTitle>Add credential</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm">API base URL</label>
              <input value={apiBase} onChange={e => setApiBase(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm">Type</label>
              <select value={type} onChange={e => setType(e.target.value as any)} className="w-full rounded border px-3 py-2 text-sm">
                <option value="ID_DOC">ID_DOC</option>
                <option value="CERT">CERT</option>
                <option value="ORCID">ORCID</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm">File (optional)</label>
              <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="block text-sm" />
            </div>
          </div>
          <button onClick={uploadAndCreate} className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700">Save</button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>My credentials</CardTitle></CardHeader>
        <CardContent>
          <DataTable data={rows} columns={[
            ...columns,
            {
              id: "actions",
              header: "Actions",
              cell: ({row}) => (
                <button onClick={() => remove(row.original.id)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">Remove</button>
              )
            }
          ]} placeholder="Filter credentials…" />
        </CardContent>
      </Card>
    </main>
  );
}


