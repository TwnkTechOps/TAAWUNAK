"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "components/Card/Card";

type Unit = { id: string; name: string; parentId?: string | null; ownerUserId?: string | null };

export default function UnitsPage() {
  const params = useParams<{id: string}>();
  const institutionId = params?.id as string;
  const [units, setUnits] = useState<Unit[]>([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | "">("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  async function refresh() {
    const res = await fetch(`${apiBase}/institutions/${institutionId}/units`, { credentials: "include" });
    setUnits(await res.json());
  }

  async function createUnit() {
    await fetch(`${apiBase}/institutions/${institutionId}/units`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({ name, parentId: parentId || undefined })
    });
    setName(""); setParentId("");
    refresh();
  }

  async function renameUnit(id: string, newName: string) {
    await fetch(`${apiBase}/institutions/${institutionId}/units/${id}`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({ name: newName })
    });
    refresh();
  }

  async function reparentUnit(id: string, newParentId: string | null) {
    await fetch(`${apiBase}/institutions/${institutionId}/units/${id}`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({ parentId: newParentId })
    });
    refresh();
  }

  async function setOwner(id: string) {
    await fetch(`${apiBase}/institutions/${institutionId}/units/${id}/owner`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({ email: ownerEmail })
    });
    setOwnerEmail("");
    refresh();
  }

  useEffect(() => { if (institutionId) refresh(); }, [institutionId]);

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      <h1 className="title-lg tracking-tight text-gray-900 dark:text-white">Organization Units</h1>
      <Card className="hover-pop glass">
        <CardHeader><CardTitle>Create unit</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1 block text-sm">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="rounded border px-3 py-1.5 text-sm" placeholder="Department / College / Center" />
            </div>
            <div>
              <label className="mb-1 block text-sm">Parent</label>
              <select value={parentId} onChange={e => setParentId(e.target.value)} className="rounded border px-3 py-1.5 text-sm">
                <option value="">(root)</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <button onClick={createUnit} className="rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-700">Add</button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover-pop glass">
        <CardHeader><CardTitle>Units</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Parent</th>
                  <th className="px-3 py-2 text-left">Owner</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {units.map(u => (
                  <tr key={u.id}>
                    <td className="px-3 py-2">
                      <input defaultValue={u.name} onBlur={e => renameUnit(u.id, e.target.value)} className="w-full rounded border px-2 py-1" />
                    </td>
                    <td className="px-3 py-2">
                      <select defaultValue={u.parentId || ""} onChange={e => reparentUnit(u.id, e.target.value || null)} className="rounded border px-2 py-1">
                        <option value="">(root)</option>
                        {units.filter(x => x.id !== u.id).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <input value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} className="rounded border px-2 py-1" placeholder="owner@example.com" />
                        <button onClick={() => setOwner(u.id)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700">Set owner</button>
                      </div>
                    </td>
                    <td className="px-3 py-2" />
                  </tr>
                ))}
                {units.length === 0 && (
                  <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={4}>No units</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}


