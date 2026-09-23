import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ACTIVE_INSTRUMENT_HOLD_STATUSES,
  formatSharedLocation,
  resolveMaxConcurrentLoans,
  resolveNickname,
} from "@/lib/loan/loan-rules";
import { EditInstrumentForm } from "./EditInstrumentForm";
import { uploadInstrumentPhoto } from "./actions";
import {
  RiwayatAddendum,
  RiwayatAktivitas,
  RiwayatKondisi,
  RiwayatPeminjam,
} from "./tabs";
import { ArrowRight } from "lucide-react";
import { getConditionLabel, getStatusLabel } from "@/components/StatusBadge";
import { ItemPhotoField } from "@/components/ItemPhotoField";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "peminjam", label: "Borrower History" },
  { key: "kondisi", label: "Condition History" },
  { key: "addendum", label: "Addendum" },
  { key: "aktivitas", label: "Activity" },
] as const;

export default async function InstrumentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string; tab?: string }>;
}) {
  const { id } = await params;
  const { edit, tab = "peminjam" } = await searchParams;
  const isEditing = edit === "true";

  const instrument = await prisma.instrument.findUniqueOrThrow({
    where: { id },
  });

  const activeHolders = await prisma.borrowingRequest.findMany({
    where: {
      instrumentId: id,
      status: { in: [...ACTIVE_INSTRUMENT_HOLD_STATUSES] },
    },
    select: {
      id: true,
      borrowerName: true,
      borrowerNickname: true,
      borrowerYear: true,
    },
  });
  const statusLocked = activeHolders.length > 0;
  const displayLocation = formatSharedLocation(
    activeHolders,
    instrument.location,
  );

  const typeSlots = await prisma.instrumentTypeSlot.findMany();
  const maxConcurrentLoans = resolveMaxConcurrentLoans(
    instrument.type,
    typeSlots,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h1">{instrument.type}</h1>
        <p className="mt-1 text-sm text-foreground-2">
          {instrument.section}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail</CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
              <ItemPhotoField
                fileId={instrument.photoDriveFileId}
                alt={instrument.type}
                action={uploadInstrumentPhoto.bind(null, id)}
                className="mx-auto w-44 shrink-0 sm:mx-0"
              />
              <div className="flex flex-1 flex-col gap-4">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Brand</dt>
                    <dd className="mt-0.5 font-medium">
                      {instrument.brand || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Serial No.</dt>
                    <dd className="tabular mt-0.5 font-medium">
                      {instrument.serialNumber || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="mt-0.5 font-medium">
                      {getStatusLabel(instrument.status)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Condition</dt>
                    <dd className="mt-0.5 font-medium">
                      {getConditionLabel(instrument.condition)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="mt-0.5 font-medium">{displayLocation}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Loanable</dt>
                    <dd className="mt-0.5 font-medium">
                      {instrument.isLoanable ? "Ya" : "Tidak"}
                    </dd>
                  </div>
                  {maxConcurrentLoans > 1 && (
                    <div>
                      <dt className="text-muted-foreground">Slot</dt>
                      <dd className="tabular mt-0.5 font-medium">
                        {activeHolders.length}/{maxConcurrentLoans}
                      </dd>
                    </div>
                  )}
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Notes</dt>
                    <dd className="mt-0.5 font-medium">
                      {instrument.notes || "—"}
                    </dd>
                  </div>
                </dl>

                {activeHolders.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeHolders.map((holder) => (
                      <Link
                        key={holder.id}
                        href={`/requests/${holder.id}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "self-start",
                        )}
                      >
                        {resolveNickname(holder.borrowerName, holder.borrowerNickname)}
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  href={`/instruments/${id}?edit=true`}
                  className={cn(buttonVariants({ size: "sm" }), "self-start")}
                >
                  Edit Instrument
                </Link>
              </div>
            </div>
          ) : (
            <EditInstrumentForm
              instrument={instrument}
              statusLocked={statusLocked}
              displayLocation={displayLocation}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <div className="-mx-6 flex gap-1 overflow-x-auto border-b border-border px-6">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/instruments/${id}?tab=${t.key}`}
              className={cn(
                "shrink-0 px-5 py-3.5 text-sm whitespace-nowrap",
                tab === t.key
                  ? "-mb-px border-b-2 border-navy font-semibold text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <CardContent className="pt-5">
          {tab === "peminjam" && <RiwayatPeminjam instrumentId={id} />}
          {tab === "kondisi" && <RiwayatKondisi instrumentId={id} />}
          {tab === "addendum" && <RiwayatAddendum instrumentId={id} />}
          {tab === "aktivitas" && <RiwayatAktivitas instrumentId={id} />}
        </CardContent>
      </Card>
    </div>
  );
}
