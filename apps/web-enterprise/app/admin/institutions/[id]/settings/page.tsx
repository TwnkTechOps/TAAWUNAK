"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "components/Card/Card";

export default function InstitutionSettingsPage() {
  const params = useParams<{id: string}>();
  const institutionId = params?.id as string;
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function setOwner() {
    const res = await fetch(`${apiBase}/institutions/${institutionId}/owner`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({ email })
    });
    setMsg(res.ok ? "Owner updated" : "Update failed");
    if (res.ok) setEmail("");
  }

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      <h1 className="title-lg tracking-tight text-gray-900 dark:text-white">Institution Settings</h1>
      <Card className="hover-pop glass">
        <CardHeader><CardTitle>Ownership</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1 block text-sm">Owner email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} className="rounded border px-3 py-1.5 text-sm" placeholder="owner@example.com" />
            </div>
            <button onClick={setOwner} className="rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-700">Transfer ownership</button>
            {msg && <span className="text-sm text-gray-600 dark:text-gray-300">{msg}</span>}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}


