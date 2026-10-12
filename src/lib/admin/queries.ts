import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const PENDING_REQUEST_STATUSES = [
  "submitted",
  "reviewing",
  "contract_generated",
  "documents_uploaded",
  "ready_to_pickup",
] as const;

export const getPendingRequestCount = cache(() =>
  prisma.borrowingRequest.count({
    where: { status: { in: [...PENDING_REQUEST_STATUSES] } },
  }),
);

export function countTransferableLoans() {
  return prisma.borrowingRequest.count({
    where: {
      status: { in: ["active", "overdue"] },
      carriedOverAt: null,
    },
  });
}
