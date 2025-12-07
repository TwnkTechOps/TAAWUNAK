"use client";

import {useState} from "react";

export function FormTemplate({
  onSubmit
}: {
  onSubmit: (data: Record<string, string>) => Promise<void> | void;
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({title, summary});
      setTitle("");
      setSummary("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Summary</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full rounded border px-3 py-2"
          rows={4}
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={loading}
          type="submit"
          className="rounded bg-brand px-3 py-1 text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

