"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Instrument, ItemCondition } from "@/generated/prisma/client";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyCell } from "@/components/DataTable";

const CONDITION_TRIAGE_ORDER: Record<ItemCondition, number> = {
  need_repair: 0,
  lost: 1,
  ok: 2,
  retired: 3,
};

export type InstrumentWithDisplayLocation = Instrument & {
  displayLocation: string;
};

export const columns: ColumnDef<InstrumentWithDisplayLocation>[] = [
  { accessorKey: "section", header: "Section" },
  { accessorKey: "type", header: "Instrument" },
  { accessorKey: "brand", header: "Brand" },
  {
    accessorKey: "serialNumber",
    header: "Serial no.",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.serialNumber ? (
        <span className="tabular">{row.original.serialNumber}</span>
      ) : (
        <EmptyCell />
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
  { accessorKey: "displayLocation", header: "Location" },
];
