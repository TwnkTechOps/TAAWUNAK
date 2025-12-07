"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "components/Card/Card";
import {clearToken} from "components/auth/clientStorage";

export default function LoginPage() {
  const [apiBase, setApiBase] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [newDevice, setNewDevice] = useState<boolean>(false);
  const [requiresMfa, setRequiresMfa] = useState<any>(null);
  const router = useRouter();

  function loginWithKeycloak() {
    sessionStorage.setItem("postLoginRedirect", "/settings/security");
    window.location.href = `${apiBase}/auth/oidc/keycloak/login`;
  }

  function loginWithEduGAIN() {
    sessionStorage.setItem("postLoginRedirect", "/settings/security");
    window.location.href = `${apiBase}/auth/saml/edugain/login`;
  }

  useEffect(() => {
    try {
      const has = document.cookie.split(";").map(s => s.trim()).some(s => s.startsWith("tawawunak_device="));
      setNewDevice(!has);
    } catch {
      setNewDevice(true);
    }
  }, []);


  async function login() {
    setMsg(null);
    setRequiresMfa(null);
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({email, password, otp: otp || undefined})
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        // Check if adaptive MFA is required
        if (res.status === 400 && errorData.requiresMfa) {
          setRequiresMfa(errorData);
          if (errorData.adaptive) {
            let message = errorData.message || "Additional verification required due to security risk. OTP has been sent to your email. Please check your inbox and enter the code.";
            // DEMO MODE: Show OTP in message if provided
            if (errorData.demoOtp) {
              message = `[DEMO MODE] Your OTP code is: ${errorData.demoOtp}\n\n${message}`;
              // Auto-fill OTP for demo
              setOtp(errorData.demoOtp);
            }
            setMsg(message);
          } else {
            setMsg("MFA is enabled for your account. Please enter your OTP code.");
          }
          return;
        }
        
        throw new Error(errorData.message || "Login failed");
      }
      
      const data = await res.json();
      if (!data?.token) throw new Error("No token returned");
      
      // set API cookie for session
      await fetch(`${apiBase}/auth/session`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({token: data.token})
      });
      
      setMsg("Login successful. Redirecting...");
      // Force full page reload to refresh auth state
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (e: any) {
      setMsg(e?.message || "Login failed");
    }
  }

  async function logout() {
    try {
      await fetch(`${apiBase}/auth/logout`, {method: "POST", credentials: "include"});
    } catch {}
    setMsg("Logged out.");
  }

  return (
    <main className="mx-auto max-w-md space-y-6 px-5 py-12">
      <Card>
        <CardHeader><CardTitle>Login</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {newDevice && (
            <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              New device detected. OTP will be required if your account has MFA or adaptive checks are triggered.
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm">API base URL</label>
            <input value={apiBase} onChange={e => setApiBase(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          {requiresMfa && (
            <div className="rounded border border-blue-300 bg-blue-50 px-3 py-2 text-xs text-blue-900">
              <div className="font-semibold mb-1">Additional Verification Required</div>
              <div className="mb-1">Risk Score: {requiresMfa.risk}/100</div>
              <div className="mb-1">Factors: {requiresMfa.factors?.join(", ") || "Unknown"}</div>
              {requiresMfa.adaptive && (
                <div className="mt-2 text-xs">
                  <div className="font-medium">OTP has been sent to your email.</div>
                  <div className="text-blue-700">Please check your inbox and enter the 6-digit code below.</div>
                  {requiresMfa.demoOtp && (
                    <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                      <div className="font-bold text-yellow-900">[DEMO MODE]</div>
                      <div className="text-yellow-800">Your OTP code: <strong className="text-lg">{requiresMfa.demoOtp}</strong></div>
                      <div className="text-yellow-700 text-xs mt-1">This code has been auto-filled for you.</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm">
              OTP {requiresMfa ? "(Required)" : "(if MFA is enabled)"}
            </label>
            <input 
              value={otp} 
              onChange={e => setOtp(e.target.value)} 
              className="w-full rounded border px-3 py-2 text-sm" 
              placeholder="123456"
              required={!!requiresMfa}
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={login} className="rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-700">Login</button>
            <button onClick={logout} className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50">Logout</button>
          </div>
          <div className="pt-2">
            <button onClick={loginWithKeycloak} className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50">
              Login with Keycloak
            </button>
            <button onClick={loginWithEduGAIN} className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 ml-2">
              Login with eduGAIN (mock)
            </button>
          </div>
          {msg && (
            <div className={`text-sm p-3 rounded ${
              msg.includes("successful") || msg.includes("DEMO MODE") 
                ? "bg-green-50 text-green-900 border border-green-300" 
                : msg.includes("failed") || msg.includes("Invalid")
                ? "bg-red-50 text-red-900 border border-red-300"
                : "bg-blue-50 text-blue-900 border border-blue-300"
            }`}>
              <div className="whitespace-pre-line">{msg}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

