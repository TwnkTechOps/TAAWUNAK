"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearGlobalAuth } from "lib/auth/useAuth";

type Device = { deviceId: string; ua?: string; ip?: string; lastSeen?: string; revoked?: boolean; createdAt?: string };

export default function SecuritySettingsPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>("");
  const router = useRouter();
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  async function handleLogout() {
    try {
      // Clear auth state immediately
      clearGlobalAuth();
      // Call logout API to clear cookies
      await fetch(`${apiBase}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      // Force redirect and clear any cached data
      window.location.href = "/auth/login";
    }
  }
  
  useEffect(() => {
    // Only access document on client side
    if (typeof window !== "undefined") {
      const m = document.cookie.split(";").map(s => s.trim()).find(s => s.startsWith("tawawunak_device="));
      setCurrentDeviceId(m ? decodeURIComponent(m.substring("tawawunak_device=".length)) : "");
    }
  }, []);

  async function refresh() {
    try {
      const res = await fetch(`${apiBase}/auth/sessions/devices`, { credentials: "include" });
      if (!res.ok) {
        setDevices([]);
        return;
      }
      const list = await res.json();
      setDevices(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Failed to load devices:", e);
      setDevices([]);
    }
  }

  async function revoke(deviceId: string) {
    await fetch(`${apiBase}/auth/sessions/devices/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ deviceId })
    });
    refresh();
  }

  useEffect(() => { refresh(); }, []);

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) px-5 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="title-lg tracking-tight text-gray-900 dark:text-white">Security & Sessions</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
      <div className="mb-4">
        <button
          onClick={async () => {
            await fetch(`${apiBase}/auth/session/revoke`, { method: "POST", credentials: "include" });
            refresh();
          }}
          className="rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-700"
        >
          Revoke all sessions
        </button>
      </div>
      <div className="mt-4 rounded-xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 font-semibold">Active devices</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-200">
              <tr>
                <th className="px-3 py-2 text-left">Device ID</th>
                <th className="px-3 py-2 text-left">User Agent</th>
                <th className="px-3 py-2 text-left">IP</th>
                <th className="px-3 py-2 text-left">Last seen</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {devices.map((d) => (
                <tr key={d.deviceId} className="align-top">
                  <td className="px-3 py-2">{d.deviceId}{d.deviceId === currentDeviceId ? " (this device)" : ""}</td>
                  <td className="px-3 py-2">{d.ua || "—"}</td>
                  <td className="px-3 py-2">{d.ip || "—"}</td>
                  <td className="px-3 py-2">{d.lastSeen || "—"}</td>
                  <td className="px-3 py-2">{d.revoked ? "revoked" : "active"}</td>
                  <td className="px-3 py-2 text-right">
                    {!d.revoked && (
                      <button onClick={() => revoke(d.deviceId)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700">
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {devices.length === 0 && (
                <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={6}>No devices</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

