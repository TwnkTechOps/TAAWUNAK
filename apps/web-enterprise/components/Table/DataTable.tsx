/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { twMerge } from "tailwind-merge"

export function DataTable<TData>({
  data,
  columns,
  placeholder = "Search…",
  isLoading = false,
  emptyMessage = "No data found",
  viewKey,
}: {
  data: TData[]
  columns: ColumnDef<TData, any>[]
  placeholder?: string
  isLoading?: boolean
  emptyMessage?: string
  viewKey?: string
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [density, setDensity] = useState<"cozy" | "compact">("cozy")
  const cellPad = density === "compact" ? "px-3 py-1.5" : "px-4 py-2"

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  function exportCsv() {
    const headers = columns.map(c => (typeof c.header === "string" ? c.header : (c as any).accessorKey || "") as string);
    const rows = table.getFilteredRowModel().rows.map(r =>
      r.getVisibleCells().map(c => {
        const v = c.getValue() as any;
        const s = v == null ? "" : String(v);
        return `"${s.replace(/"/g, '""')}"`;
      }).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function saveView() {
    if (!viewKey) return;
    try {
      const payload = JSON.stringify({sorting, globalFilter});
      localStorage.setItem(`view:${viewKey}`, payload);
    } catch {}
  }
  function loadView() {
    if (!viewKey) return;
    try {
      const raw = localStorage.getItem(`view:${viewKey}`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setSorting(parsed.sorting || []);
      setGlobalFilter(parsed.globalFilter || "");
    } catch {}
  }
  function resetView() {
    setSorting([]);
    setGlobalFilter("");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 dark:border-gray-700 dark:bg-gray-900"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDensity(density === "cozy" ? "compact" : "cozy")}
            className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700"
            aria-label="Toggle density"
          >
            {density === "cozy" ? "Compact" : "Comfortable"}
          </button>
          <button onClick={exportCsv} className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700">Export CSV</button>
          {viewKey && (
            <>
              <button onClick={saveView} className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700">Save View</button>
              <button onClick={loadView} className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700">Load View</button>
              <button onClick={resetView} className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700">Reset</button>
            </>
          )}
        </div>
      </div>
      <div className="overflow-auto rounded border dark:border-gray-800 max-h-[60vh]">
        <table className="min-w-full divide-y text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900/80 backdrop-blur supports-backdrop-blur:bg-gray-50/80 dark:supports-backdrop-blur:bg-gray-900/80">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className={twMerge(
                      `cursor-pointer select-none ${cellPad} text-left font-medium text-gray-700 dark:text-gray-200`
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: "↑", desc: "↓" }[h.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({length: 6}).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={`${i}-${j}`} className={cellPad}>
                      <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-800" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cellPad}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded border px-2 py-1 text-xs disabled:opacity-50 dark:border-gray-700"
          >
            Prev
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded border px-2 py-1 text-xs disabled:opacity-50 dark:border-gray-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

