import { prisma } from "@/lib/prisma";
import { AssignSection } from "./AssignSection";
import { confirmAvailable } from "./actions";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await prisma.borrowingRequest.findUniqueOrThrow({
    where: { id },
    include: {
      instrument: true,
    },
  });

  const candidates = await prisma.instrument.findMany({
    where: {
      status: "available",
      condition: "ok",
      isLoanable: true,
      type: { contains: request.instrumentTypeRequested, mode: "insensitive" },
    },
  });

  return (
    <div>
      <h1>
        {request.borrowerName} — {request.ticketId}
      </h1>
      <p>Status: {request.status}</p>
      <p>Instrument Requested: {request.instrumentTypeRequested}</p>
      <p>
        Email: {request.borrowerEmail} · Phone: {request.borrowerPhone} · LINE:{" "}
        {request.borrowerLineId}
      </p>

      <AssignSection
        requestId={id}
        currentInstrument={request.instrument}
        candidates={candidates}
      />

      <form action={confirmAvailable.bind(null, id)}>
        <button type="submit" disabled={!request.instrumentId}>
          Notify Borrower
        </button>
      </form>
    </div>
  );
}
