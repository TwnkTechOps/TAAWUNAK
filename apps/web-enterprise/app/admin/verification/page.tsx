"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "components/Card/Card";

export default function VerificationCenter() {
  const [apiBase, setApiBase] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312");
  const [domain, setDomain] = useState("");
  const [domainRes, setDomainRes] = useState<any>(null);
  const [nid, setNid] = useState("");
  const [nafath, setNafath] = useState<any>(null);
  const [passport, setPassport] = useState({number: "", name: "", country: ""});
  const [passReq, setPassReq] = useState<any>(null);

  async function checkDomain() {
    const r = await fetch(`${apiBase}/verification/domain/check`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({domain})
    }).then(r => r.json());
    setDomainRes(r);
  }

  async function startNafath() {
    const r = await fetch(`${apiBase}/verification/nafath/start`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({nationalId: nid})
    }).then(r => r.json());
    const status = await fetch(`${apiBase}/verification/nafath/status`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({requestId: r.requestId})
    }).then(r => r.json());
    setNafath({...r, ...status});
  }

  async function startPassport() {
    const r = await fetch(`${apiBase}/verification/passport/start`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({passportNumber: passport.number, name: passport.name, country: passport.country})
    }).then(r => r.json());
    const status = await fetch(`${apiBase}/verification/passport/status`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({requestId: r.requestId})
    }).then(r => r.json());
    setPassReq({...r, ...status});
  }

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      <h1 className="title-lg tracking-tight text-gray-900 dark:text-white">Verification Center (MVP mock)</h1>

      <Card className="hover-pop glass">
        <CardHeader><CardTitle>API connection</CardTitle></CardHeader>
        <CardContent>
          <label className="mb-1 block text-sm">API base URL</label>
          <input value={apiBase} onChange={e => setApiBase(e.target.value)} className="w-full max-w-md rounded border px-3 py-2 text-sm" />
        </CardContent>
      </Card>

      <Card className="hover-pop glass">
        <CardHeader><CardTitle>Domain verification</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <input value={domain} onChange={e => setDomain(e.target.value)} className="rounded border px-3 py-1.5 text-sm" placeholder="ksu.edu.sa" />
            <button onClick={checkDomain} className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50">Check</button>
          </div>
          {domainRes && <div className="text-sm">Status: {domainRes.status}</div>}
        </CardContent>
      </Card>

      <Card className="hover-pop glass">
        <CardHeader><CardTitle>Nafath (mock)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <input value={nid} onChange={e => setNid(e.target.value)} className="rounded border px-3 py-1.5 text-sm" placeholder="National ID" />
            <button onClick={startNafath} className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50">Start</button>
          </div>
          {nafath && <div className="text-sm">Request: {nafath.requestId} — Status: {nafath.status}</div>}
        </CardContent>
      </Card>

      <Card className="hover-pop glass">
        <CardHeader><CardTitle>Passport (mock)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="grid gap-2 md:grid-cols-3">
            <input value={passport.number} onChange={e => setPassport({...passport, number: e.target.value})} className="rounded border px-3 py-1.5 text-sm" placeholder="Passport number" />
            <input value={passport.name} onChange={e => setPassport({...passport, name: e.target.value})} className="rounded border px-3 py-1.5 text-sm" placeholder="Name" />
            <input value={passport.country} onChange={e => setPassport({...passport, country: e.target.value})} className="rounded border px-3 py-1.5 text-sm" placeholder="Country" />
          </div>
          <button onClick={startPassport} className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50">Start</button>
          {passReq && <div className="text-sm">Request: {passReq.requestId} — Status: {passReq.status}</div>}
        </CardContent>
      </Card>
    </main>
  );
}


