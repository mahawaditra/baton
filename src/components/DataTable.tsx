"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type CellContext,
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const INTERACTIVE_SELECTOR = "a, button, input, select, textarea, label";

export function EmptyCell() {
  return <span className="text-muted-foreground">—</span>;
}

function DefaultCell<T>({ getValue }: CellContext<T, unknown>) {
  const value = getValue();
  if (value === null || value === undefined || value === "") {
    return <EmptyCell />;
  }
  return String(value);
}

export function DataTable<T>({
  data,
  columns,
  getRowHref,
  linkColumn,
  onOverflow,
  sorting: controlledSorting,
  onSortingChange: controlledOnSortingChange,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  getRowHref: (row: T) => string;
  linkColumn: string;
  onOverflow: (overflow: number) => void;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
}) {
  const router = useRouter();
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const sorting = controlledSorting ?? internalSorting;
  const onSortingChange = controlledOnSortingChange ?? setInternalSorting;

  const table = useReactTable({
    data,
    columns,
    defaultColumn: { cell: DefaultCell },
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const columnCount = columns.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [selectedHref, setSelectedHref] = useState<string | null>(null);

  useEffect(() => {
    if (selectedHref === null) return;
    function handlePointerDown(event: PointerEvent) {
      if (!tableRef.current?.contains(event.target as Node)) {
        setSelectedHref(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedHref(null);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedHref]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const tableElement = tableRef.current;
    if (!container || !tableElement) return;
    const observer = new ResizeObserver(() => {
      const overflow = tableElement.offsetWidth - container.clientWidth;
      if (overflow > 0) onOverflow(overflow);
    });
    observer.observe(container);
    observer.observe(tableElement);
    return () => observer.disconnect();
  }, [onOverflow]);

  function openInNewTab(href: string) {
    window.open(href, "_blank", "noopener");
  }

  function hasModifier(event: React.MouseEvent) {
    return event.metaKey || event.ctrlKey || event.shiftKey;
  }

  function selectOrOpen(href: string) {
    if (selectedHref === href) {
      router.push(href);
    } else {
      setSelectedHref(href);
    }
  }

  function handleRowClick(
    event: React.MouseEvent<HTMLTableRowElement>,
    href: string,
  ) {
    if ((event.target as Element).closest(INTERACTIVE_SELECTOR)) return;
    if (window.getSelection()?.toString()) return;
    if (hasModifier(event)) {
      openInNewTab(href);
      return;
    }
    selectOrOpen(href);
  }

  function handleLinkClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    if (event.detail === 0 || hasModifier(event)) return;
    event.preventDefault();
    selectOrOpen(href);
  }

  function handleRowAuxClick(
    event: React.MouseEvent<HTMLTableRowElement>,
    href: string,
  ) {
    if (event.button !== 1) return;
    if ((event.target as Element).closest(INTERACTIVE_SELECTOR)) return;
    openInNewTab(href);
  }

  return (
    <div
      ref={containerRef}
      className="overflow-clip rounded-lg border border-border bg-surface"
    >
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
      <table ref={tableRef} className="data-table w-full text-sm">
        <thead className="sticky top-0 z-10 bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="h-10 divide-x divide-border">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                const label = flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                );
                return (
                  <th
                    key={header.id}
                    aria-sort={
                      sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : undefined
                    }
                    className={cn(
                      "text-left text-micro uppercase text-muted-foreground",
                      !canSort && "px-4",
                    )}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex h-10 w-full cursor-(--cursor-link) items-center gap-1 px-4 uppercase outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
                      >
                        {label}
                        {sorted === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : sorted === "desc" ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-75" />
                        )}
                      </button>
                    ) : (
                      label
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const href = getRowHref(row.original);
            return (
              <tr
                key={row.id}
                onClick={(event) => handleRowClick(event, href)}
                onAuxClick={(event) => handleRowAuxClick(event, href)}
                data-selected={selectedHref === href || undefined}
                className="h-14 cursor-(--cursor-link) divide-x divide-border border-t border-border hover:bg-muted/75 data-selected:bg-gold-soft/60 data-selected:hover:bg-gold-soft/60"
              >
                {row.getVisibleCells().map((cell) => {
                  const content = flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext(),
                  );
                  return (
                    <td key={cell.id} className="px-4 py-3">
                      {cell.column.id === linkColumn ? (
                        <Link
                          href={href}
                          onClick={(event) => handleLinkClick(event, href)}
                          className="rounded-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
