"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "components/Card/Card";
// cookie-based auth; no token access on client

type UserType = "researcher" | "company" | "university" | "school" | "government";

export default function OnboardingPage() {
  const [apiBase, setApiBase] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312");
  const [userType, setUserType] = useState<UserType>("researcher");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionDomain, setInstitutionDomain] = useState("");
  // role-specific
  const [orcid, setOrcid] = useState("");
  const [scholar, setScholar] = useState("");
  const [crNumber, setCrNumber] = useState("");
  const [taxId, setTaxId] = useState("");
  const [govCode, setGovCode] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  const needsInstitution = userType !== "researcher";

  useEffect(() => {
    setMessage(null);
    // Check if user is authenticated via cookie
    fetch(`${apiBase}/auth/me`, {
      credentials: "include"
    })
      .then(res => {
        setIsAuthenticated(res.ok);
        if (!res.ok) {
          setMessage("Please log in first.");
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, [apiBase]);

  async function createInstitution() {
    const res = await fetch(`${apiBase}/institutions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: institutionName,
        type: userType,
        domain: institutionDomain || undefined
      })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function submit() {
    setMessage(null);
    if (needsInstitution && !institutionName) {
      setMessage("Please enter institution name.");
      return;
    }
    setBusy(true);
    try {
      // best-effort: attach role metadata to user profile
      try {
        await fetch(`${apiBase}/users/me`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            profile: {
              userType,
              orcid: orcid || undefined,
              scholar: scholar || undefined,
              crNumber: crNumber || undefined,
              taxId: taxId || undefined,
              govCode: govCode || undefined,
              website: website || undefined
            }
          })
        });
      } catch {}
      if (needsInstitution) {
        await createInstitution();
        setMessage("Organization onboarding created. Awaiting verification by platform admins.");
      } else {
        setMessage("Researcher onboarding complete.");
      }
      setTimeout(() => router.push("/dashboard"), 900);
    } catch (e: any) {
      setMessage(e?.message || "Onboarding failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg space-y-6 px-5 py-10">
      <Card>
        <CardHeader><CardTitle>Onboarding</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <label className="mb-1 block text-sm">API base URL</label>
            <input value={apiBase} onChange={e => setApiBase(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          {isAuthenticated === false && (
            <div className="rounded border p-3 text-sm">
              Not logged in. <Link className="underline" href="/auth/login">Go to login</Link>
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm">Select your user type</label>
            <div className="grid grid-cols-2 gap-2">
              {(["researcher","company","university","school","government"] as UserType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setUserType(t)}
                  className={`rounded border px-3 py-2 text-sm ${userType===t ? "border-emerald-600 bg-emerald-50" : "hover:bg-gray-50"}`}
                >
                  {t[0].toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {needsInstitution && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm">Institution name</label>
                <input value={institutionName} onChange={e => setInstitutionName(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" placeholder="e.g., King Saud University" />
              </div>
              <div>
                <label className="mb-1 block text-sm">Domain (optional)</label>
                <input value={institutionDomain} onChange={e => setInstitutionDomain(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" placeholder="e.g., ksu.edu.sa" />
              </div>
              <div>
                <label className="mb-1 block text-sm">Website (optional)</label>
                <input value={website} onChange={e => setWebsite(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" placeholder="https://example.sa" />
              </div>
              <div className="text-xs text-gray-500">
                We will create an organization record as unverified. Platform admins (or delegated authorities) will verify it.
              </div>
            </div>
          )}

          {/* role-specific fields */}
          {userType === "researcher" && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm">ORCID</label>
                <input value={orcid} onChange={e => setOrcid(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" placeholder="0000-0002-1825-0097" />
              </div>
              <div>
                <label className="mb-1 block text-sm">Google Scholar URL</label>
                <input value={scholar} onChange={e => setScholar(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" placeholder="https://scholar.google.com/citations?user=..." />
              </div>
            </div>
          )}
          {userType === "company" && (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm">CR number</label>
                <input value={crNumber} onChange={e => setCrNumber(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm">Tax ID</label>
                <input value={taxId} onChange={e => setTaxId(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
              </div>
            </div>
          )}
          {userType === "government" && (
            <div>
              <label className="mb-1 block text-sm">Entity code</label>
              <input value={govCode} onChange={e => setGovCode(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <button onClick={submit} disabled={busy} className="rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-700 disabled:opacity-50">
              {busy ? "Saving..." : "Continue"}
            </button>
            <Link href="/dashboard" className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50">Skip for now</Link>
          </div>
          {message && <div className="text-sm">{message}</div>}
        </CardContent>
      </Card>
    </main>
  );
}

