"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState, useEffect, useMemo} from "react";
import {useParams, useRouter} from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import {Card, CardContent, CardHeader, CardTitle} from "components/Card/Card";
import {getToken} from "components/auth/clientStorage";

export default function VerifyInstitutionPage() {
  const params = useParams<{id: string}>();
  const router = useRouter();
  const id = params?.id as string;
  const [apiBase, setApiBase] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const token = useMemo(() => getToken(), []);

  useEffect(() => {
    if (!id) return;
    // optionally fetch institution details to display
  }, [id]);

  async function submitVerify(verified: boolean) {
    setStatus(null);
    try {
      const res = await fetch(`${apiBase}/institutions/${id}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? {Authorization: `Bearer ${token}`} : {})
        },
        credentials: "include",
        body: JSON.stringify({verified, evidenceUrl: evidenceUrl || undefined, note: note || undefined})
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus(verified ? "Marked as verified." : "Marked as rejected.");
      setTimeout(() => router.push(`/admin/institutions`), 800);
    } catch (e: any) {
      setStatus(e?.message || "Verification update failed.");
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || !token) return;
    try {
      // 1) ask API for presigned URL
      const key = `verification/${id}/${Date.now()}-${f.name}`;
      const pres = await fetch(`${apiBase}/files/presign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({key, contentType: f.type || "application/octet-stream"})
      }).then(r => r.json());
      // 2) upload to S3/MinIO
      const put = await fetch(pres.url, {
        method: "PUT",
        headers: {"Content-Type": f.type || "application/octet-stream"},
        body: f
      });
      if (!put.ok) throw new Error("Upload failed");
      // 3) use public URL
      setEvidenceUrl(pres.publicUrl);
      setStatus("File uploaded.");
    } catch (err: any) {
      setStatus(err?.message || "Upload failed.");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <main className="mx-auto max-w-lg space-y-6 px-5 py-8">
      <h1 className="title-lg tracking-tight text-gray-900 dark:text-white">Institution Verification</h1>
      <Card className="hover-pop glass">
        <CardHeader><CardTitle>Verify Institution</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="mb-1 block text-sm">API base URL</label>
            <input value={apiBase} onChange={e => setApiBase(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Evidence URL (document or site)</label>
            <input value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" placeholder="https://…" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Upload evidence file</label>
            <input type="file" onChange={handleFile} className="block text-sm" />
            <div className="text-xs text-gray-500 mt-1">Accepted any file type (dev). Uploaded to MinIO via pre-signed URL.</div>
          </div>
          <div>
            <label className="mb-1 block text-sm">Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" rows={3} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => submitVerify(true)} className="rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-700">Verify</button>
            <button onClick={() => submitVerify(false)} className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50">Reject</button>
          </div>
          {status && <div className="text-sm">{status}</div>}
        </CardContent>
      </Card>
    </main>
  );
}

