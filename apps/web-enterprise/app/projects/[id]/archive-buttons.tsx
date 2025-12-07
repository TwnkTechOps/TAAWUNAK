"use client";

import { useState, useMemo } from "react";
import { Archive, RotateCcw, X } from "lucide-react";
import { Button } from "components/Button/Button";

export function ArchiveButton({ projectId, onArchive }: { projectId: string; onArchive: () => void }) {
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState("");

  async function handleArchive() {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/archive/projects/${projectId}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        setDialogOpen(false);
        onArchive();
      }
    } catch (error) {
      console.error("Failed to archive project:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setDialogOpen(true)} size="sm" intent="secondary">
        <Archive size={16} className="mr-2" />
        Archive
      </Button>
      {dialogOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setDialogOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-base font-semibold">Archive Project</div>
              <button
                onClick={() => setDialogOpen(false)}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleArchive(); }} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Reason (optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                  rows={3}
                  placeholder="Why are you archiving this project?"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="rounded border px-3 py-1.5 text-sm dark:border-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1 rounded bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  Archive Project
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}

export function RestoreButton({ projectId, onRestore }: { projectId: string; onRestore: () => void }) {
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);
  const [loading, setLoading] = useState(false);

  async function handleRestore() {
    if (!confirm("Are you sure you want to restore this project?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/archive/projects/${projectId}/restore`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        onRestore();
      }
    } catch (error) {
      console.error("Failed to restore project:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleRestore} size="sm" intent="secondary" disabled={loading}>
      <RotateCcw size={16} className="mr-2" />
      Restore
    </Button>
  );
}

