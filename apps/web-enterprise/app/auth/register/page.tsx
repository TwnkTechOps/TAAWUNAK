"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState} from "react";
import {useRouter} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "components/Card/Card";

export default function RegisterPage() {
  const [apiBase, setApiBase] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function register() {
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({fullName, email, password})
      });
      if (!res.ok) throw new Error(await res.text());
      // Auto-login after register
      const login = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password})
      });
      const data = await login.json();
      if (!data?.token) throw new Error("Registration ok, but login failed");
      // Set cookie-based session
      await fetch(`${apiBase}/auth/session`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({token: data.token})
      });
      setMsg("Registration successful. Redirecting...");
      // Force full page reload to refresh auth state
      setTimeout(() => {
        window.location.href = "/auth/onboarding";
      }, 500);
    } catch (e: any) {
      setMsg(e?.message || "Registration failed");
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-6 px-5 py-12">
      <Card>
        <CardHeader><CardTitle>Register</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="mb-1 block text-sm">API base URL</label>
            <input value={apiBase} onChange={e => setApiBase(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Full name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={register} className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700">Create account</button>
          </div>
          {msg && <div className="text-sm">{msg}</div>}
        </CardContent>
      </Card>
    </main>
  );
}

