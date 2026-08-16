"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Instrument, ItemCondition } from "@/generated/prisma/client";
import { StatusBadge } from "@/components/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONDITION_TRIAGE_ORDER: Record<ItemCondition, number> = {
  need_repair: 0,
  lost: 1,
  ok: 2,
  retired: 3,
};

export const columns: ColumnDef<Instrument>[] = [
  { accessorKey: "section", header: "Section" },
  { accessorKey: "type", header: "Instrument" },
  { accessorKey: "brand", header: "Brand" },
  {
    accessorKey: "serialNumber",
    header: "Serial No.",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="tabular">{row.original.serialNumber}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => CONDITION_TRIAGE_ORDER[row.condition],
    cell: ({ row }) => (
      <StatusBadge
        status={row.original.status}
        condition={row.original.condition}
      />
    ),
  },
  { accessorKey: "location", header: "Location" },
  {
    id: "view",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        href={`/admin/instruments/${row.original.id}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        View
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
      </Link>
    ),
  },
];
