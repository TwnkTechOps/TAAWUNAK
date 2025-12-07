"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import {useMemo, useState} from "react";
import {Table, THead, TBody, TH, TD} from "./table";
import {Input} from "./input";
import {Button} from "./button";

export function DataTable<TData>({
  data,
  columns,
  globalFilterPlaceholder = "Search..."
}: {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  globalFilterPlaceholder?: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {sorting, globalFilter},
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder={globalFilterPlaceholder}
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <Button variant="secondary" onClick={() => { setGlobalFilter(""); setSorting([]); }}>
          Reset
        </Button>
      </div>
      <div className="overflow-hidden rounded border">
        <Table>
          <THead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TH key={header.id} onClick={header.column.getToggleSortingHandler()} className="cursor-pointer select-none">
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: "↑", desc: "↓" }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TH>
                ))}
              </tr>
            ))}
          </THead>
          <TBody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <TD key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TD>
                ))}
              </tr>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}

