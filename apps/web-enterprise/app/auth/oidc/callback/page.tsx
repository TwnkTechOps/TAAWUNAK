"use client";

import {useEffect, useState, Suspense} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {setToken} from "components/auth/clientStorage";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function OidcCallbackContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [msg, setMsg] = useState("Processing SSO response...");

  useEffect(() => {
    const t = params.get("token");
    if (t) {
      setToken(t);
      setMsg("SSO successful. Redirecting...");
      const to = sessionStorage.getItem("postLoginRedirect") || "/settings/security";
      sessionStorage.removeItem("postLoginRedirect");
      setTimeout(() => router.replace(to), 800);
    } else {
      setMsg("No token found in callback.");
    }
  }, [params, router]);

  return (
    <main className="mx-auto max-w-md px-5 py-12">
      <div className="rounded border p-4">{msg}</div>
    </main>
  );
}

export default function OidcCallback() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md px-5 py-12"><div className="rounded border p-4">Loading...</div></main>}>
      <OidcCallbackContent />
    </Suspense>
  );
}

