"use client";

import Link from "next/link";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, THead, TBody, TH, TD} from "@/components/ui/table";

export default function ProposalsPage() {
  const list = [
    {id: "r1", project: "Arabic NLP for Education", status: "UNDER_REVIEW"},
    {id: "r2", project: "Smart Classroom Analytics", status: "SUBMITTED"}
  ];
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Proposals</CardTitle>
        <Link href="./proposals/new" className="rounded bg-brand px-3 py-1 text-white hover:bg-brand-dark">New Proposal</Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded border">
          <Table>
            <THead>
              <tr>
                <TH>Project</TH>
                <TH>Status</TH>
                <TH></TH>
              </tr>
            </THead>
            <TBody>
              {list.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <TD>{p.project}</TD>
                  <TD><span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{p.status}</span></TD>
                  <TD className="text-right">
                    <Link href={`./proposals/${p.id}`} className="text-brand hover:underline">View</Link>
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

