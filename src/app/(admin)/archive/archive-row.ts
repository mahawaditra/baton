import type { Prisma } from "@/generated/prisma/client";

export const archiveRowSelect = {
  id: true,
  status: true,
  createdAt: true,
  borrowerName: true,
  borrowerNickname: true,
  borrowerYear: true,
  instrumentTypeRequested: true,
  depositRefundAmount: true,
  instrument: { select: { type: true, serialNumber: true } },
  loanPeriods: { select: { id: true } },
} satisfies Prisma.BorrowingRequestSelect;

export type ArchivedRequest = Prisma.BorrowingRequestGetPayload<{
  select: typeof archiveRowSelect;
}>;
