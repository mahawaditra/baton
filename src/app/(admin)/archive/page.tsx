import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArchiveExplorer } from "./ArchiveExplorer";
import { archiveRowSelect } from "./archive-row";
import {
  ARCHIVE_STATUSES,
  buildArchiveHref,
  buildArchiveWhere,
  parseArchiveStatus,
  parseArchiveYear,
} from "./archive-query";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Archive, ArchiveX, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toJakartaCalendarDate } from "@/lib/format";
import { getRequestStatusLabel } from "@/lib/labels";

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    status?: string;
    borrower?: string;
    instrument?: string;
  }>;
}) {
  const { year, status, borrower, instrument } = await searchParams;
  const parsedYear = parseArchiveYear(year);
  const parsedStatus = parseArchiveStatus(status);

  const [allArchived, requests] = await Promise.all([
    prisma.borrowingRequest.findMany({
      where: { status: { in: [...ARCHIVE_STATUSES] } },
      select: { createdAt: true },
    }),
    prisma.borrowingRequest.findMany({
      where: buildArchiveWhere({
        year: parsedYear,
        status: parsedStatus,
        borrower,
        instrument,
      }),
      select: archiveRowSelect,
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  const availableYears = [
    ...new Set(
      allArchived.map((r) => toJakartaCalendarDate(r.createdAt).getUTCFullYear()),
    ),
  ].sort((a, b) => b - a);

  const isFiltered = Boolean(
    parsedYear || parsedStatus || borrower || instrument,
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="hidden text-h1 lg:block">Archive</h1>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildArchiveHref({ status: parsedStatus })}
            className={cn(
              buttonVariants({
                variant: !parsedYear ? "default" : "outline",
                size: "sm",
              }),
            )}
          >
            All Years
          </Link>
          {availableYears.map((y) => (
            <Link
              key={y}
              href={buildArchiveHref({ year: y, status: parsedStatus })}
              className={cn(
                buttonVariants({
                  variant: parsedYear === y ? "default" : "outline",
                  size: "sm",
                }),
              )}
            >
              {y}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={buildArchiveHref({ year: parsedYear })}
            className={cn(
              buttonVariants({
                variant: !parsedStatus ? "default" : "outline",
                size: "sm",
              }),
            )}
          >
            All Statuses
          </Link>
          {ARCHIVE_STATUSES.map((s) => (
            <Link
              key={s}
              href={buildArchiveHref({ year: parsedYear, status: s })}
              className={cn(
                buttonVariants({
                  variant: parsedStatus === s ? "default" : "outline",
                  size: "sm",
                }),
              )}
            >
              {getRequestStatusLabel(s)}
            </Link>
          ))}
        </div>
      </div>

      <form className="flex flex-wrap items-center gap-2">
        <Input
          name="borrower"
          placeholder="Search borrower name"
          defaultValue={borrower}
          className="max-w-xs"
        />
        <Input
          name="instrument"
          placeholder="Search instrument type/serial"
          defaultValue={instrument}
          className="max-w-xs"
        />
        {parsedYear && <input type="hidden" name="year" value={parsedYear} />}
        {parsedStatus && (
          <input type="hidden" name="status" value={parsedStatus} />
        )}
        <Button type="submit" variant="outline" size="sm">
          <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
          Search
        </Button>
      </form>

      {requests.length === 0 ? (
        <EmptyState
          icon={isFiltered ? ArchiveX : Archive}
          title={
            isFiltered
              ? "No matching archived requests"
              : "No archived requests yet"
          }
          description={
            isFiltered
              ? "Try a different year, status, borrower name, or instrument."
              : "Returned, rejected, and cancelled requests will show up here."
          }
        />
      ) : (
        <ArchiveExplorer requests={requests} />
      )}
    </div>
  );
}
