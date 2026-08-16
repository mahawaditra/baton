"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Good, ItemCondition } from "@/generated/prisma/client";
import { ConditionIndicator } from "@/components/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONDITION_TRIAGE_ORDER: Record<ItemCondition, number> = {
  need_repair: 0,
  lost: 1,
  ok: 2,
  retired: 3,
};

export const columns: ColumnDef<Good>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "brand", header: "Brand" },
  { accessorKey: "quantity", header: "Qty" },
  {
    id: "condition",
    header: "Condition",
    accessorFn: (row) => CONDITION_TRIAGE_ORDER[row.condition],
    cell: ({ row }) => (
      <ConditionIndicator condition={row.original.condition} />
    ),
  },
  { accessorKey: "location", header: "Location" },
  {
    accessorKey: "registrationNo",
    header: "Reg. No.",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="tabular">{row.original.registrationNo}</span>
    ),
  },
  {
    id: "view",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        href={`/admin/goods/${row.original.id}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        View
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
      </Link>
    ),
  },
];
