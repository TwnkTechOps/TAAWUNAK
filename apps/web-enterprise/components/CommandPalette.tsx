"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

type Cmd = { id: string; title: string; shortcut?: string; action: () => void };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();

  const cmds: Cmd[] = [
    {id: "dashboard", title: "Go to Dashboard", shortcut: "D", action: () => router.push("/dashboard")},
    {id: "projects", title: "Go to Projects", shortcut: "P", action: () => router.push("/projects")},
    {id: "funding", title: "Go to Funding", shortcut: "F", action: () => router.push("/funding")},
    {id: "proposals", title: "Go to Proposals", action: () => router.push("/proposals")},
    {id: "papers", title: "Go to Papers", action: () => router.push("/papers")},
    {id: "institutions", title: "Admin: Institutions", action: () => router.push("/admin/institutions")},
    {id: "credentials", title: "Admin: Credentials", action: () => router.push("/admin/credentials")},
    {id: "verification", title: "Admin: Verification Center", action: () => router.push("/admin/verification")},
    {id: "security", title: "Settings: Security (MFA)", action: () => router.push("/settings/security")},
    {id: "login", title: "Login", action: () => router.push("/auth/login")}
  ];

  const filtered = cmds.filter(c => c.title.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (open && e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)}>
      <div className="absolute left-1/2 top-20 w-[90vw] max-w-xl -translate-x-1/2 rounded-xl border bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-900" onClick={e => e.stopPropagation()}>
        <input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Type a command or search… (Press Esc to close)"
          className="mb-2 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 dark:border-gray-700 dark:bg-gray-900"
        />
        <div className="max-h-64 overflow-auto">
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => { setOpen(false); c.action(); }}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span>{c.title}</span>
              {c.shortcut && <kbd className="rounded border px-1 text-xs">{c.shortcut}</kbd>}
            </button>
          ))}
          {filtered.length === 0 && <div className="px-3 py-4 text-sm text-gray-500">No results</div>}
        </div>
      </div>
    </div>
  );
}


