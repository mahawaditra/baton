import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { EditInstrumentForm } from "./EditInstrumentForm";
import {
  RiwayatAddendum,
  RiwayatAktivitas,
  RiwayatKondisi,
  RiwayatPeminjam,
} from "./tabs";
import { ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
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

  const activeRequest =
    instrument.status === "borrowed"
      ? await prisma.borrowingRequest.findFirst({
          where: { instrumentId: id, status: { in: ["active", "overdue"] } },
        })
      : null;

  const statusLocked =
    instrument.status === "reserved" || instrument.status === "borrowed";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h1">{instrument.type}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {instrument.section}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail</CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="flex flex-col gap-4">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <StatusBadge
                      status={instrument.status}
                      condition={instrument.condition}
                    />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Brand</dt>
                  <dd className="mt-0.5 font-medium">{instrument.brand}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Serial No.</dt>
                  <dd className="tabular mt-0.5 font-medium">
                    {instrument.serialNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Loanable</dt>
                  <dd className="mt-0.5 font-medium">
                    {instrument.isLoanable ? "Ya" : "Tidak"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="mt-0.5 font-medium">{instrument.location}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Notes</dt>
                  <dd className="mt-0.5 font-medium">
                    {instrument.notes || "—"}
                  </dd>
                </div>
              </dl>

              {activeRequest && (
                <Link
                  href={`/admin/requests/${activeRequest.id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "self-start",
                  )}
                >
                  Lihat peminjaman aktif
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </Link>
              )}

              <Link
                href={`/admin/instruments/${id}?edit=true`}
                className={cn(buttonVariants({ size: "sm" }), "self-start")}
              >
                Edit Instrument
              </Link>
            </div>
          ) : (
            <EditInstrumentForm
              instrument={instrument}
              statusLocked={statusLocked}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <div className="-mx-6 flex gap-1 overflow-x-auto border-b border-border px-6">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/admin/instruments/${id}?tab=${t.key}`}
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
