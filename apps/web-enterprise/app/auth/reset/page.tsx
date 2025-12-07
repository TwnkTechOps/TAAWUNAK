"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params?.get("token") || "";
  const [password, setPassword] = useState("");
  const [done, setDone] = useState<"idle"|"ok"|"error">("idle");
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${base}/auth/password/reset`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({token, newPassword: password})
    });
    setDone(res.ok ? "ok" : "error");
  }

  return (
    <main className="mx-auto max-w-lg px-5 py-10">
      <h1 className="title-lg">Set new password</h1>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input type="password" className="w-full rounded border px-3 py-2" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="rounded bg-brand px-4 py-2 text-white" type="submit">Update password</button>
      </form>
      {done === "ok" && <p className="mt-3 text-emerald-600">Password updated. Please sign in.</p>}
      {done === "error" && <p className="mt-3 text-red-600">Invalid or expired token.</p>}
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-lg px-5 py-10"><p>Loading...</p></main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}


