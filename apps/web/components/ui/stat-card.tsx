"use client";

import {ReactNode} from "react";
import {Card, CardContent} from "./card";

export function StatCard({
  label,
  value,
  delta,
  icon
}: {
  label: string;
  value: string;
  delta?: string;
  icon?: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        {icon && (
          <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
            {icon}
          </div>
        )}
        <div className="py-3">
          <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
          {delta && <div className="mt-1 text-xs text-green-600">{delta}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

