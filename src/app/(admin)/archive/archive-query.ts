import type { Prisma } from "@/generated/prisma/client";

export const ARCHIVE_STATUSES = ["returned", "rejected", "cancelled"] as const;

export type ArchiveStatus = (typeof ARCHIVE_STATUSES)[number];

const JAKARTA_OFFSET_HOURS = 7;

export function parseArchiveYear(year: string | undefined): number | null {
  return year && /^\d{4}$/.test(year) ? Number(year) : null;
}

export function parseArchiveStatus(
  status: string | undefined,
): ArchiveStatus | undefined {
  return ARCHIVE_STATUSES.find((s) => s === status);
}

export function buildArchiveHref(params: {
  year?: number | null;
  status?: string;
}): string {
  const query = new URLSearchParams();
  if (params.year) query.set("year", String(params.year));
  if (params.status) query.set("status", params.status);
  const queryString = query.toString();
  return queryString ? `/archive?${queryString}` : "/archive";
}

export function buildArchiveWhere(params: {
  year: number | null;
  status: ArchiveStatus | undefined;
  borrower?: string;
  instrument?: string;
}): Prisma.BorrowingRequestWhereInput {
  const searchFilters: Prisma.BorrowingRequestWhereInput[] = [];

  if (params.borrower) {
    searchFilters.push({
      OR: [
        { borrowerName: { contains: params.borrower, mode: "insensitive" } },
        { borrowerNickname: { contains: params.borrower, mode: "insensitive" } },
      ],
    });
  }

  if (params.instrument) {
    searchFilters.push({
      OR: [
        {
          instrument: {
            type: { contains: params.instrument, mode: "insensitive" },
          },
        },
        {
          instrument: {
            serialNumber: { contains: params.instrument, mode: "insensitive" },
          },
        },
        {
          instrumentTypeRequested: {
            contains: params.instrument,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  return {
    status: params.status ?? { in: [...ARCHIVE_STATUSES] },
    ...(params.year && {
      createdAt: {
        gte: new Date(Date.UTC(params.year, 0, 1, -JAKARTA_OFFSET_HOURS)),
        lt: new Date(Date.UTC(params.year + 1, 0, 1, -JAKARTA_OFFSET_HOURS)),
      },
    }),
    AND: searchFilters,
  };
}
