"use client";

import React, { useEffect, useMemo, useState } from "react";

export default function NewProjectFormBasic() {
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);
  const [institutions, setInstitutions] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [objectives, setObjectives] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetUsd, setBudgetUsd] = useState<number | "">("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [collaboratorsInput, setCollaboratorsInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/institutions`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (!cancel) setInstitutions(Array.isArray(data) ? data : []);
        }
      } catch {}
    })();
    return () => {
      cancel = true;
    };
  }, [apiBase]);

  function parseTags(value: string): string[] {
    return value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12);
  }

  function parseEmails(value: string): string[] {
    const emails = value
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean)
      .slice(0, 20);
    return emails;
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title || title.trim().length < 4) next.title = "Title must be at least 4 characters.";
    if (!summary || summary.trim().length < 20) next.summary = "Summary must be at least 20 characters.";
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) next.endDate = "End date cannot be before start date.";
    if (budgetUsd !== "" && Number(budgetUsd) < 0) next.budgetUsd = "Budget cannot be negative.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function applyDemo() {
    const demoTitle = "AI-Powered Rural Health Outreach";
    const demoSummary =
      "A collaborative initiative to deploy AI triage assistants and mobile clinics in underserved rural communities. Phase 1 targets 5 districts with telemedicine and predictive screening.";
    const demoObjectives =
      "- Deploy community health AI assistant in 10 villages\n- Train 50 CHWs on digital triage\n- Reduce referral time by 30%\n- Publish open dataset on outcomes";
    const demoTags = "healthcare, ai, rural, outreach, telemedicine, sdg3";
    const demoStart = new Date();
    const demoEnd = new Date();
    demoEnd.setMonth(demoEnd.getMonth() + 6);
    setTitle(demoTitle);
    setSummary(demoSummary);
    setObjectives(demoObjectives);
    setTagsInput(demoTags);
    setTags(parseTags(demoTags));
    setStartDate(demoStart.toISOString().slice(0, 10));
    setEndDate(demoEnd.toISOString().slice(0, 10));
    setBudgetUsd(75000);
    setVisibility("public");
    setCollaboratorsInput("lead@example.org, field.ops@example.org");
    // pre-select first institution if empty
    if (!institutionId && institutions[0]) setInstitutionId(institutions[0].id);
    setMsg("Demo data filled. You can adjust anything and submit.");
  }

  function handleTagsBlur() {
    setTags(parseTags(tagsInput));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!validate()) {
      setMsg("Please resolve the highlighted errors.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          summary,
          institutionId: institutionId === "none" || !institutionId ? null : institutionId,
          objectives,
          tags,
          startDate: startDate || null,
          endDate: endDate || null,
          budgetUsd: budgetUsd === "" ? null : Number(budgetUsd),
          visibility,
          collaborators: parseEmails(collaboratorsInput),
        }),
      });
      if (res.ok) {
        const p = await res.json();
        setMsg("Created. Redirecting…");
        setTimeout(() => {
          window.location.href = `/projects/${p.id}`;
        }, 600);
      } else {
        const err = await res.json().catch(() => ({}));
        setMsg(err?.message || "Failed to create project.");
      }
    } catch (err: any) {
      setMsg(err?.message || "Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 max-w-2xl space-y-4">
      <div>
        <label className="mb-1 block text-sm">Project Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="e.g., AI for Rural Healthcare"
          required
        />
        {errors.title && <div className="mt-1 text-xs text-red-600">{errors.title}</div>}
      </div>
      <div>
        <label className="mb-1 block text-sm">Executive Summary</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
          rows={4}
          placeholder="Brief overview of purpose, scope and expected outcomes…"
          required
        />
        {errors.summary && <div className="mt-1 text-xs text-red-600">{errors.summary}</div>}
      </div>
      <div>
        <label className="mb-1 block text-sm">Objectives and Key Results</label>
        <textarea
          value={objectives}
          onChange={(e) => setObjectives(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
          rows={4}
          placeholder="- Objective 1\n- Objective 2\n- KPI A, KPI B…"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm">Lead Institution (optional)</label>
        <select
          value={institutionId}
          onChange={(e) => setInstitutionId(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
        >
          <option value="">
            {institutions.length === 0 ? "No institutions available" : "Select institution"}
          </option>
          <option value="none">Personal project (no institution)</option>
          {institutions.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
        {errors.institutionId && <div className="mt-1 text-xs text-red-600">{errors.institutionId}</div>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {errors.endDate && <div className="mt-1 text-xs text-red-600">{errors.endDate}</div>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Estimated Budget (USD)</label>
          <input
            type="number"
            min="0"
            step="100"
            value={budgetUsd}
            onChange={(e) => setBudgetUsd(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="e.g., 75000"
          />
          {errors.budgetUsd && <div className="mt-1 text-xs text-red-600">{errors.budgetUsd}</div>}
        </div>
        <div>
          <label className="mb-1 block text-sm">Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as "public" | "private")}
            className="w-full rounded border px-3 py-2 text-sm"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm">Tags</label>
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          onBlur={handleTagsBlur}
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Comma-separated: health, ai, outreach"
        />
        {!!tags.length && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((t, idx) => (
              <span key={`${t}-${idx}`} className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm">Collaborators (emails, comma-separated)</label>
        <input
          value={collaboratorsInput}
          onChange={(e) => setCollaboratorsInput(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="lead@example.org, analyst@example.org"
        />
      </div>
      {msg && <div className="rounded border border-blue-300 bg-blue-50 px-3 py-2 text-xs">{msg}</div>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={applyDemo}
          className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Fill Demo Data
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-brand px-4 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Project"}
        </button>
        <a href="/projects" className="rounded border px-3 py-2 text-sm hover:bg-gray-50">
          Cancel
        </a>
      </div>
    </form>
  );
}


