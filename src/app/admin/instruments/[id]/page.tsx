import { prisma } from "@/lib/prisma";
import { EditInstrumentForm } from "./EditInstrumentForm";
import {
  RiwayatAddendum,
  RiwayatAktivitas,
  RiwayatKondisi,
  RiwayatPeminjam,
} from "./tabs";
import Link from "next/link";

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
    <div>
      <h1>
        {instrument.type} — {instrument.section}
      </h1>

      {!isEditing ? (
        <>
          <p>Brand: {instrument.brand}</p>
          <p>Serial No.: {instrument.serialNumber}</p>
          <p>Condition: {instrument.condition}</p>
          <p>Status: {instrument.status}</p>
          <p>Loanable: {instrument.isLoanable ? "Yes" : "No"}</p>
          <p>Location: {instrument.location}</p>
          <p>Notes: {instrument.notes}</p>

          {activeRequest && (
            <p>
              Active loan:{" "}
              <Link href={`/admin/requests/${activeRequest.id}`}>
                View request →
              </Link>
            </p>
          )}

          <Link href={`/admin/instruments/${id}?edit=true`}>
            <button>Edit Instrument</button>
          </Link>
        </>
      ) : (
        <EditInstrumentForm instrument={instrument} statusLocked={statusLocked} />
      )}
      <div>
        <nav>
          <Link href={`/admin/instruments/${id}?tab=peminjam`}>
            Riwayat Peminjam
          </Link>
          <Link href={`/admin/instruments/${id}?tab=kondisi`}>
            Riwayat Kondisi
          </Link>
          <Link href={`/admin/instruments/${id}?tab=addendum`}>Addendum</Link>
          <Link href={`/admin/instruments/${id}?tab=aktivitas`}>Aktivitas</Link>
        </nav>

        {tab === "peminjam" && <RiwayatPeminjam instrumentId={id} />}
        {tab === "kondisi" && <RiwayatKondisi instrumentId={id} />}
        {tab === "addendum" && <RiwayatAddendum instrumentId={id} />}
        {tab === "aktivitas" && <RiwayatAktivitas instrumentId={id} />}
      </div>
    </div>
  );
}
