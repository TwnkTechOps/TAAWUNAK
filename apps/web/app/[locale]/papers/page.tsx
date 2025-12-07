"use client";

import Link from "next/link";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, THead, TBody, TH, TD} from "@/components/ui/table";

export default function PapersPage() {
  const list = [
    {id: "pa1", title: "Arabic ASR for Classrooms", status: "PUBLISHED"},
    {id: "pa2", title: "Federated Learning in K-12", status: "UNDER_REVIEW"}
  ];
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Papers</CardTitle>
        <Link href="./papers/new" className="rounded bg-brand px-3 py-1 text-white hover:bg-brand-dark">Submit Paper</Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded border">
          <Table>
            <THead>
              <tr>
                <TH>Title</TH>
                <TH>Status</TH>
                <TH></TH>
              </tr>
            </THead>
            <TBody>
              {list.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <TD>{p.title}</TD>
                  <TD><span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{p.status}</span></TD>
                  <TD className="text-right">
                    <Link href={`./papers/${p.id}`} className="text-brand hover:underline">View</Link>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

