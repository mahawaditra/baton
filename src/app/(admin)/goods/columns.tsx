"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Good, ItemCondition } from "@/generated/prisma/client";
import { ConditionIndicator, getConditionLabel } from "@/components/StatusBadge";
import { EmptyCell } from "@/components/DataTable";

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
      <span className="inline-flex items-center gap-1.5">
        {getConditionLabel(row.original.condition)}
        <ConditionIndicator condition={row.original.condition} />
      </span>
    ),
  },
  { accessorKey: "location", header: "Location" },
  {
    accessorKey: "registrationNo",
    header: "Reg. no.",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.registrationNo ? (
        <span className="tabular">{row.original.registrationNo}</span>
      ) : (
        <EmptyCell />
      ),
  },
];
