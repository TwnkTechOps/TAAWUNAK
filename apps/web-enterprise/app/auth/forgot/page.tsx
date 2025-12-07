"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${base}/auth/password/forgot`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email})
    });
    const data = await res.json();
    setToken(data?.token || null);
    setDone(true);
  }

  return (
    <main className="mx-auto max-w-lg px-5 py-10">
      <h1 className="title-lg">Reset password</h1>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input className="w-full rounded border px-3 py-2" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        <button className="rounded bg-brand px-4 py-2 text-white" type="submit">Send reset link</button>
      </form>
      {done && (
        <div className="mt-4 text-sm">
          If the email exists, a link has been sent.
          {process.env.NODE_ENV !== "production" && token && (
            <div className="mt-2 rounded border p-2">
              Dev token (copy): <code className="break-all">{token}</code>
            </div>
          )}
        </div>
      )}
    </main>
  );
}


