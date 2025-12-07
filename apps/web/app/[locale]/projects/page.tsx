"use client";

import {useMemo} from "react";
import Link from "next/link";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {ColumnDef} from "@tanstack/react-table";
import {DataTable} from "@/components/ui/datatable";
import {Badge} from "@/components/ui/badge";

export default function ProjectsPage() {
  const projects = useMemo(() => [
    {id: "p1", title: "Smart Classroom Analytics", status: "ACTIVE", institutionName: "King Saud University"},
    {id: "p2", title: "Arabic NLP for Education", status: "DRAFT", institutionName: "KAUST"},
    {id: "p3", title: "Renewable Energy Lab Pilot", status: "COMPLETED", institutionName: "KFUPM"}
  ] as any[], []);
  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    {accessorKey: "title", header: "Title"},
    {accessorKey: "institutionName", header: "Institution"},
    {accessorKey: "status", header: "Status", cell: ({getValue}) => <Badge>{getValue() as string}</Badge>},
    {id: "actions", header: "", cell: ({row}) => (
      <Link href={`./projects/${row.original.id}`} className="text-brand hover:underline">
        View
      </Link>
    )}
  ], []);
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Projects</CardTitle>
        <Link href="./projects/new">
          <Button className="flex items-center gap-2"><Plus size={16}/> New Project</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <DataTable data={projects} columns={columns} globalFilterPlaceholder="Filter projects..." />
      </CardContent>
    </Card>
  );
}

