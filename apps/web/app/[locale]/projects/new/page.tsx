"use client";

import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function NewProjectPage() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // TODO: Replace with POST to API /projects
      await new Promise((r) => setTimeout(r, 600));
      setSaved(true);
      setTitle("");
      setSummary("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Project</CardTitle>
      </CardHeader>
      <CardContent>
        {saved && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            Project saved (demo). You can now return to{" "}
            <Link href="../" className="underline">Projects</Link>.
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" rows={5} value={summary} onChange={(e) => setSummary(e.target.value)} required />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            <Link href="../"><Button variant="secondary" type="button">Cancel</Button></Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

