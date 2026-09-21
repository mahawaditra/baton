import { prisma } from "@/lib/prisma";
import { InstrumentsExplorer } from "./InstrumentsExplorer";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AdminHeaderAction } from "@/components/AdminHeaderAction";
import {
  ACTIVE_INSTRUMENT_HOLD_STATUSES,
  formatSharedLocation,
} from "@/lib/loan/loan-rules";

export default async function InstrumentsPage() {
  const instrumentsRaw = await prisma.instrument.findMany({
    orderBy: { section: "asc" },
    include: {
      borrowingRequests: {
        where: { status: { in: [...ACTIVE_INSTRUMENT_HOLD_STATUSES] } },
        select: { borrowerName: true, borrowerNickname: true, borrowerYear: true },
      },
    },
  });

  const instruments = instrumentsRaw.map((inst) => ({
    ...inst,
    displayLocation: formatSharedLocation(inst.borrowingRequests, inst.location),
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="hidden text-h1 lg:block">Instruments</h1>
      <AdminHeaderAction>
        <Link
          href="/admin/instruments/new"
          aria-label="New Instrument"
          className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
        >
          <Plus className="h-5 w-5" strokeWidth={1.75} />
        </Link>
      </AdminHeaderAction>
      <InstrumentsExplorer
        instruments={instruments}
        action={
          <Link href="/admin/instruments/new" className={buttonVariants()}>
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            New Instrument
          </Link>
        }
      />
    </div>
  );
}
