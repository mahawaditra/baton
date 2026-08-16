import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { columns } from "./columns";
import { DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Archive, ArchiveX, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    borrower?: string;
    instrument?: string;
  }>;
}) {
  const { year, borrower, instrument } = await searchParams;
  const parsedYear = year && /^\d{4}$/.test(year) ? Number(year) : null;

  const allReturned = await prisma.borrowingRequest.findMany({
    where: { status: "returned" },
    select: { createdAt: true },
  });
  const availableYears = [
    ...new Set(allReturned.map((r) => r.createdAt.getFullYear())),
  ].sort((a, b) => b - a);

  const requests = await prisma.borrowingRequest.findMany({
    where: {
      status: "returned",
      ...(parsedYear && {
        createdAt: {
          gte: new Date(`${parsedYear}-01-01`),
          lt: new Date(`${parsedYear + 1}-01-01`),
        },
      }),
      ...(borrower && {
        borrowerName: { contains: borrower, mode: "insensitive" },
      }),
      ...(instrument && {
        instrument: {
          OR: [
            { type: { contains: instrument, mode: "insensitive" } },
            { serialNumber: { contains: instrument, mode: "insensitive" } },
          ],
        },
      }),
    },
    include: {
      instrument: true,
      loanPeriods: { orderBy: { sequence: "desc" } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const isFiltered = Boolean(parsedYear || borrower || instrument);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1">Archive</h1>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/archive"
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
            href={`/admin/archive?year=${y}`}
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
        {year && <input type="hidden" name="year" value={year} />}
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
              ? "No matching archived borrowings"
              : "No archived borrowings yet"
          }
          description={
            isFiltered
              ? "Try a different year, borrower name, or instrument."
              : "Completed borrowings will show up here once returned."
          }
        />
      ) : (
        <DataTable data={requests} columns={columns} />
      )}
    </div>
  );
}
