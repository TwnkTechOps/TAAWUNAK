"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function VerifyConfirmContent() {
  const params = useSearchParams();
  const token = params?.get("token") || "";
  const [status, setStatus] = useState<"pending"|"ok"|"error">("pending");
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    fetch(`${base}/auth/email/verify`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({token})
    }).then(r => r.ok ? setStatus("ok") : setStatus("error")).catch(() => setStatus("error"));
  }, [token, base]);

  return (
    <main className="mx-auto max-w-lg px-5 py-10">
      <h1 className="title-lg">Confirm email</h1>
      {status === "pending" && <p className="mt-3">Verifying…</p>}
      {status === "ok" && <p className="mt-3 text-emerald-600">Email verified. You may close this window.</p>}
      {status === "error" && <p className="mt-3 text-red-600">Invalid or expired token.</p>}
    </main>
  );
}

export default function VerifyConfirmPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-lg px-5 py-10"><p>Loading...</p></main>}>
      <VerifyConfirmContent />
    </Suspense>
  );
}


