"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function DataTable<T>({
  data,
  columns,
  sorting: controlledSorting,
  onSortingChange: controlledOnSortingChange,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
}) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const sorting = controlledSorting ?? internalSorting;
  const onSortingChange = controlledOnSortingChange ?? setInternalSorting;

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const columnCount = columns.length;

  return (
    <div className="rounded-lg border border-border bg-surface">
      <style>{`@media (hover: hover) and (pointer: fine) {
${Array.from({ length: columnCount }, (_, i) => {
        const n = i + 1;
        return `table.data-table:has(tbody td:nth-child(${n}):hover) thead th:nth-child(${n}),
table.data-table:has(tbody td:nth-child(${n}):hover) tbody td:nth-child(${n}) {
  background-color: color-mix(in oklab, var(--muted) 35%, transparent);
}`;
      }).join("\n")}
table.data-table tbody td:hover {
  box-shadow: inset 0 0 0 999px color-mix(in oklab, var(--muted) 25%, transparent);
}
}`}</style>
      <table className="data-table w-full text-sm">
        <thead className="sticky top-0 z-10 rounded-t-lg bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="h-10 divide-x divide-border">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    className={cn(
                      "px-4 text-left text-micro uppercase text-muted-foreground",
                      canSort && "cursor-pointer select-none",
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {canSort &&
                        (sorted === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : sorted === "desc" ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-75" />
                        ))}
                    </span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="[&>tr:last-child>td:first-child]:rounded-bl-lg [&>tr:last-child>td:last-child]:rounded-br-lg">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="h-14 divide-x divide-border border-t border-border hover:bg-muted/75"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
