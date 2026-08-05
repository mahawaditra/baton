import { prisma } from "@/lib/prisma";
import { AssignSection } from "./AssignSection";
import {
  confirmAvailable,
  confirmDocumentsReviewed,
  confirmHandover,
  rejectRequest,
  reviewDocument,
} from "./actions";

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
      condition: { in: ["ok", "need_repair"] },
      isLoanable: true,
      type: { contains: request.instrumentTypeRequested, mode: "insensitive" },
    },
  });

  const latestPeriod = await prisma.loanPeriod.findFirst({
    where: { requestId: request.id },
    orderBy: { sequence: "desc" },
  });

  const documents = latestPeriod
    ? await prisma.document.findMany({
        where: { periodId: latestPeriod.id },
        distinct: ["type"],
        orderBy: { uploadedAt: "desc" },
      })
    : [];

  const addendums = latestPeriod
    ? await prisma.addendum.findMany({
        where: { periodId: latestPeriod.id },
        orderBy: { submittedAt: "asc" },
      })
    : [];

  const canAssign = ["submitted", "reviewing"].includes(request.status);
  const canNotify =
    request.status === "reviewing" && !request.instrumentConfirmed;

  return (
    <div>
      <h1>
        {request.borrowerName} — {request.ticketId}
      </h1>
      <p>Status: {request.status}</p>
      {request.status === "active" && latestPeriod?.dueDate && (
        <p>Due Date: {latestPeriod.dueDate.toLocaleDateString("id-ID")}</p>
      )}
      <p>Instrument Requested: {request.instrumentTypeRequested}</p>
      <p>
        Email: {request.borrowerEmail} · Phone: {request.borrowerPhone} · LINE:{" "}
        {request.borrowerLineId}
      </p>
      {canAssign && (
        <>
          <AssignSection
            requestId={id}
            currentInstrument={request.instrument}
            candidates={candidates}
            disabled={!canAssign}
          />

          <form action={confirmAvailable.bind(null, id)}>
            <button type="submit" disabled={!canNotify}>
              Notify Borrower
            </button>
          </form>
        </>
      )}
      {["submitted", "reviewing"].includes(request.status) && (
        <form action={rejectRequest.bind(null, id)}>
          <textarea name="reason" placeholder="Reason for rejection" required />
          <button type="submit">Reject Request</button>
        </form>
      )}
      {request.status === "documents_uploaded" && (
        <div>
          <h2>Review Documents</h2>
          {documents.map((doc) => (
            <div key={doc.id}>
              <a href={`/admin/documents/${doc.id}`} target="_blank">
                View {doc.type}
              </a>
              <span> — {doc.reviewStatus}</span>
              {doc.reviewStatus === "pending" && (
                <>
                  <form action={reviewDocument.bind(null, doc.id, "approved")}>
                    <button type="submit">Approve</button>
                  </form>
                  <form action={reviewDocument.bind(null, doc.id, "rejected")}>
                    <input
                      name="notes"
                      placeholder="Reason for rejection"
                      required
                    />
                    <button type="submit">Reject</button>
                  </form>
                </>
              )}
              {doc.reviewerNotes && <p>Note: {doc.reviewerNotes}</p>}
            </div>
          ))}

          <form action={confirmDocumentsReviewed.bind(null, id)}>
            <button
              type="submit"
              disabled={
                documents.length !== 3 ||
                !documents.every((d) => d.reviewStatus === "approved")
              }
            >
              Confirm Documents & Notify Ready for Pickup
            </button>
          </form>
        </div>
      )}
      {addendums.length > 0 && (
        <div>
          <h2>Condition Addendum</h2>
          {addendums.map((a) => (
            <div key={a.id}>
              <h3>
                {a.timing === "initial"
                  ? "Initial Condition"
                  : "Final Condition"}
              </h3>
              <p>Completeness: {a.completeness}</p>
              <p>Body Condition: {a.bodyCondition}</p>
              {a.accessoriesCondition && (
                <p>Accessories Condition: {a.accessoriesCondition}</p>
              )}
              {a.notes && <p>Notes: {a.notes}</p>}
              <div>
                {a.driveFileIds.map((fileId) => (
                  <a
                    key={fileId}
                    href={`/admin/drive-files/${fileId}`}
                    target="_blank"
                  >
                    View Photo
                  </a>
                ))}
              </div>
            </div>
          ))}
          {request.status === "ready_to_pickup" && (
            <form action={confirmHandover.bind(null, id)}>
              <button type="submit">Confirm Handover</button>
            </form>
          )}
        </div>
      )}
      {request.status === "ready_to_pickup" && addendums.length === 0 && (
        <p>Waiting for borrower to submit the initial addendum at Sekre.</p>
      )}
    </div>
  );
}
