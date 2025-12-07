"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/Card/Card";
import { getToken } from "components/auth/clientStorage";
import { AdminNav } from "components/Nav/AdminNav";

export default function PolicyEditorPage() {
  const [text, setText] = useState("{\n  \"audit:read\": [\"ADMIN\"]\n}");
  const [error, setError] = useState<string | null>(null);
  const token = useMemo(() => getToken(), []);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  async function load() {
    const res = await fetch(`${apiBase}/policy`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: "include"
    });
    const matrix = await res.json();
    setText(JSON.stringify(matrix, null, 2));
  }

  async function save() {
    try {
      const parsed = JSON.parse(text);
      const res = await fetch(`${apiBase}/policy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify({ matrix: parsed })
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Invalid JSON");
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      <AdminNav />
      <h1 className="title-lg tracking-tight text-gray-900 dark:text-white">Policy Matrix</h1>
      <Card className="hover-pop glass">
        <CardHeader><CardTitle>Permissions → Roles</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Edit the policy matrix (JSON). Example: {"{\"audit:read\":[\"ADMIN\"]}"}.
          </p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className="mt-3 h-80 w-full rounded border p-3 font-mono text-sm"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex items-center gap-2">
            <button onClick={load} className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700">Reload</button>
            <button onClick={save} className="rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-700">Save</button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}


