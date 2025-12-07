"use client";

import Link from "next/link";

type Project = {
  id: string;
  title: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED";
  institutionName: string;
};

export function ProjectListTemplate({projects}: {projects: Project[]}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects</h2>
        <Link href="./projects/new" className="rounded bg-brand px-3 py-1 text-white hover:bg-brand-dark">
          New Project
        </Link>
      </div>
      <div className="overflow-hidden rounded border">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Title</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Institution</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{p.title}</td>
                <td className="px-4 py-2">{p.institutionName}</td>
                <td className="px-4 py-2">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{p.status}</span>
                </td>
                <td className="px-4 py-2 text-right">
                  <Link href={`./projects/${p.id}`} className="text-brand hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

