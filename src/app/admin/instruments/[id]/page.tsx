import { prisma } from "@/lib/prisma";
import { updateInstrument } from "./actions";
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
          where: { instrumentId: id, status: "active" },
        })
      : null;

  const updateWithId = updateInstrument.bind(null, id);

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
        <form action={updateWithId}>
          <input
            name="brand"
            defaultValue={instrument.brand ?? ""}
            placeholder="Brand"
          />
          <input
            name="serialNumber"
            defaultValue={instrument.serialNumber ?? ""}
            placeholder="Serial No."
          />

          <select name="condition" defaultValue={instrument.condition}>
            <option value="ok">OK</option>
            <option value="need_repair">Need Repair</option>
            <option value="retired">Retired</option>
            <option value="lost">Lost</option>
          </select>

          <select name="status" defaultValue={instrument.status}>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="borrowed">Borrowed</option>
            <option value="placed">Placed</option>
            <option value="unavailable">Unavailable</option>
          </select>

          <input
            name="location"
            defaultValue={instrument.location}
            placeholder="Location"
          />
          <textarea
            name="notes"
            defaultValue={instrument.notes ?? ""}
            placeholder="Notes"
          />

          <button type="submit">Save</button>
        </form>
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
