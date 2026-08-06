import { prisma } from "@/lib/prisma";
import { AssignSection } from "./AssignSection";
import {
  confirmAvailable,
  confirmDocumentsReviewed,
  confirmExtension,
  confirmHandover,
  confirmReturn,
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

  const canAssign =
    ["submitted", "reviewing"].includes(request.status) &&
    !request.instrumentConfirmed;
  const canNotify =
    request.status === "reviewing" && !request.instrumentConfirmed;

  const isExtension = latestPeriod?.periodType === "extension";

  return (
    <div>
      <h1>
        {request.borrowerName} — {request.ticketId}
      </h1>
      <p>
        Status: {request.status}
        {request.status === "reviewing" &&
          request.instrumentConfirmed &&
          " (Instrument confirmed — menunggu peminjam isi Tahap 2)"}
      </p>
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
      {["submitted", "reviewing"].includes(request.status) &&
        !request.instrumentConfirmed && (
          <form action={rejectRequest.bind(null, id)}>
            <textarea
              name="reason"
              placeholder="Reason for rejection"
              required
            />
            <button type="submit">Reject Request</button>
          </form>
        )}
      {(request.status === "documents_uploaded" ||
        (isExtension && documents.length > 0)) && (
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

          {!isExtension && (
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
          )}
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
          {isExtension && !latestPeriod?.startDate && (
            <form action={confirmExtension.bind(null, id)}>
              <button type="submit">Confirm Extension</button>
            </form>
          )}
          {request.status === "active" &&
            addendums.some((a) => a.timing === "final") && (
              <form action={confirmReturn.bind(null, id)}>
                <h3>Confirm Return</h3>
                <label>
                  Condition
                  <select name="condition" required>
                    <option value="ok">OK</option>
                    <option value="need_repair">Need Repair</option>
                    <option value="retired">Retired</option>
                    <option value="lost">Lost</option>
                  </select>
                </label>
                <label>
                  Status (ignored if Retired/Lost — forced Unavailable)
                  <select name="status" required>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </label>
                <label>
                  Location
                  <input
                    name="location"
                    type="text"
                    defaultValue="Sekre"
                    required
                  />
                </label>
                <button type="submit">Confirm Return</button>
              </form>
            )}
        </div>
      )}
      {isExtension && addendums.length === 0 && (
        <p>
          Waiting for borrower to submit the addendum for this extension period.
        </p>
      )}
    </div>
  );
}
