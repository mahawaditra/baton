import type { Prisma } from "@/generated/prisma/client";

export const requestRowSelect = {
  id: true,
  ticketId: true,
  status: true,
  instrumentConfirmed: true,
  carriedOverAt: true,
  createdAt: true,
  borrowerName: true,
  borrowerNickname: true,
  borrowerYear: true,
  borrowerPhone: true,
  borrowerLineId: true,
  instrumentTypeRequested: true,
  instrument: { select: { brand: true, serialNumber: true } },
  loanPeriods: {
    select: {
      sequence: true,
      periodType: true,
      startDate: true,
      dueDate: true,
      actualReturnDate: true,
      documents: { select: { type: true, reviewStatus: true } },
      addendums: { select: { timing: true } },
    },
    orderBy: { sequence: "desc" },
    take: 1,
  },
} satisfies Prisma.BorrowingRequestSelect;

export type RequestRow = Prisma.BorrowingRequestGetPayload<{
  select: typeof requestRowSelect;
}>;

export function hideContactUnlessHandover<
  T extends Pick<RequestRow, "status" | "borrowerPhone" | "borrowerLineId">,
>(row: T): T {
  if (row.status === "ready_to_pickup") return row;
  return { ...row, borrowerPhone: "", borrowerLineId: "" };
}
