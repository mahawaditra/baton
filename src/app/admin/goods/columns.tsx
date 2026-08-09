"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import type { Good } from "@/generated/prisma/client";
import { conditionColor } from "@/lib/constants";

export const columns: ColumnDef<Good>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "brand", header: "Brand" },
  { accessorKey: "quantity", header: "Qty" },
  {
    accessorKey: "condition",
    header: "Condition",
    cell: ({ row }) => (
      <span
        className={`rounded px-2 py-1 text-xs ${conditionColor[row.original.condition]}`}
      >
        {row.original.condition}
      </span>
    ),
  },
  { accessorKey: "location", header: "Location" },
  { accessorKey: "registrationNo", header: "Reg. No." },
  {
    id: "view",
    header: "",
    cell: ({ row }) => (
      <Link href={`/admin/goods/${row.original.id}`}>View →</Link>
    ),
  },
];
