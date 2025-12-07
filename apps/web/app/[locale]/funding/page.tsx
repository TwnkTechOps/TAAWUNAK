"use client";

import Link from "next/link";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, THead, TBody, TH, TD} from "@/components/ui/table";

export default function FundingPage() {
  const list = [
    {id: "f1", title: "AI in Education Call 2025", deadline: "2025-12-31"},
    {id: "f2", title: "Green Tech University-Industry Grants", deadline: "2026-03-15"}
  ];
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Funding Calls</CardTitle>
        <Link href="./funding/new" className="rounded bg-brand px-3 py-1 text-white hover:bg-brand-dark">New Call</Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded border">
          <Table>
            <THead>
              <tr>
                <TH>Title</TH>
                <TH>Deadline</TH>
                <TH></TH>
              </tr>
            </THead>
            <TBody>
              {list.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <TD>{f.title}</TD>
                  <TD>{f.deadline}</TD>
                  <TD className="text-right">
                    <Link href={`./funding/${f.id}`} className="text-brand hover:underline">View</Link>
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

