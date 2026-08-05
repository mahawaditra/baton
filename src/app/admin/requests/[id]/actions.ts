"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function assignInstrument(
  requestId: string,
  instrumentId: string,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not logged in");
  }

  const request = await prisma.borrowingRequest.findUniqueOrThrow({
    where: { id: requestId },
  });

  await prisma.$transaction(async (tx) => {
    if (request.instrumentId) {
      await tx.instrument.update({
        where: { id: request.instrumentId },
        data: { status: "available" },
      });
    }

    await tx.instrument.update({
      where: { id: instrumentId },
      data: { status: "reserved" },
    });

    await tx.borrowingRequest.update({
      where: { id: requestId },
      data: {
        instrumentId,
        status: request.status === "submitted" ? "reviewing" : request.status,
      },
    });
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "assign_instrument",
      entityType: "borrowing_request",
      entityId: requestId,
      metadata: { instrumentId, previousInstrumentId: request.instrumentId },
    },
  });

  revalidatePath(`/admin/requests/${requestId}`);
}

export async function confirmAvailable(requestId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not logged in");
  }

  const request = await prisma.borrowingRequest.findUniqueOrThrow({
    where: { id: requestId },
  });

  if (!request.instrumentId) {
    throw new Error("Assign an instrument before confirming availability.");
  }

  await prisma.borrowingRequest.update({
    where: { id: requestId },
    data: { instrumentConfirmed: true },
  });
  console.log(
    `[EMAIL STUB] Notify ${request.borrowerEmail}: instrument confirmed, please visit /status/${request.ticketId} to complete Stage 2 and generate your contract.`,
  );

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "notify_available",
      entityType: "borrowing_request",
      entityId: requestId,
      metadata: { notifiedEmail: request.borrowerEmail },
    },
  });

  revalidatePath(`/admin/requests/${requestId}`);
}

export async function rejectRequest(requestId: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not logged in");
  }

  const reason = formData.get("reason") as string;
  if (!reason) {
    throw new Error("Rejection reason is required.");
  }

  const request = await prisma.borrowingRequest.findUniqueOrThrow({
    where: { id: requestId },
  });

  await prisma.$transaction(async (tx) => {
    if (request.instrumentId) {
      await tx.instrument.update({
        where: { id: request.instrumentId },
        data: { status: "available" },
      });
    }

    await tx.borrowingRequest.update({
      where: { id: requestId },
      data: {
        status: "rejected",
        rejectionReason: reason,
      },
    });
  });

  console.log(
    `[EMAIL STUB] Notify ${request.borrowerEmail}: your request has been rejected. Reason: ${reason}`,
  );

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "reject_request",
      entityType: "borrowing_request",
      entityId: requestId,
      metadata: { reason, releasedInstrumentId: request.instrumentId },
    },
  });

  revalidatePath(`/admin/requests/${requestId}`);
}

export async function reviewDocument(
  documentId: string,
  decision: "approved" | "rejected",
  formData: FormData,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not logged in");
  }

  const notes = formData.get("notes") as string | null;

  if (decision === "rejected" && !notes) {
    throw new Error("Rejection notes are required when rejecting a document.");
  }

  const doc = await prisma.document.findUniqueOrThrow({
    where: { id: documentId },
    include: { period: true },
  });

  await prisma.document.update({
    where: { id: documentId },
    data: {
      reviewStatus: decision,
      reviewerNotes: notes,
      reviewedAt: new Date(),
    },
  });

  if (decision === "rejected") {
    await prisma.borrowingRequest.update({
      where: { id: doc.period.requestId },
      data: { status: "contract_generated" },
    });
    console.log(
      `[EMAIL STUB] Notify borrower: document ${doc.type} rejected. Notes: ${notes}`,
    );
  }

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action:
        decision === "approved" ? "approve_documents" : "reject_documents",
      entityType: "borrowing_request",
      entityId: doc.period.requestId,
      metadata: { documentId, type: doc.type, notes },
    },
  });

  revalidatePath(`/admin/requests/${doc.period.requestId}`);
}

export async function confirmDocumentsReviewed(requestId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not logged in");
  }

  const latestPeriod = await prisma.loanPeriod.findFirst({
    where: { requestId },
    orderBy: { sequence: "desc" },
  });

  if (!latestPeriod) {
    throw new Error("No loan period found for this request.");
  }

  const documents = await prisma.document.findMany({
    where: { periodId: latestPeriod.id },
    distinct: ["type"],
    orderBy: { uploadedAt: "desc" },
  });

  const allApproved =
    documents.length === 3 &&
    documents.every((d) => d.reviewStatus === "approved");

  if (!allApproved) {
    throw new Error(
      "All 3 required documents must be approved before confirming review.",
    );
  }

  await prisma.borrowingRequest.update({
    where: { id: requestId },
    data: { status: "ready_to_pickup" },
  });

  console.log(
    `[EMAIL STUB] Notify borrower: all documents approved. Your request is now ready for pickup at Sekre.`,
  );

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "confirm_ready",
      entityType: "borrowing_request",
      entityId: requestId,
    },
  });

  revalidatePath(`/admin/requests/${requestId}`);
}

export async function confirmHandover(requestId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not logged in");
  }

  const request = await prisma.borrowingRequest.findUniqueOrThrow({
    where: { id: requestId },
  });

  if (request.status !== "ready_to_pickup") {
    throw new Error("Request is not ready to pickup.");
  }
  if (!request.instrumentId) {
    throw new Error("No instrument assigned to this request.");
  }

  const latestPeriod = await prisma.loanPeriod.findFirst({
    where: { requestId },
    orderBy: { sequence: "desc" },
  });
  if (!latestPeriod) {
    throw new Error("No loan period found for this request.");
  }

  const addendum = await prisma.addendum.findFirst({
    where: { periodId: latestPeriod.id, timing: "initial" },
  });
  if (!addendum) {
    throw new Error("Borrower has not submitted the initial addendum yet.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.instrument.update({
      where: { id: request.instrumentId! },
      data: {
        status: "borrowed",
        location: `${request.borrowerName} (${request.borrowerYear})`,
      },
    });
    await tx.loanPeriod.update({
      where: { id: latestPeriod.id },
      data: { startDate: new Date() },
    });
    await tx.borrowingRequest.update({
      where: { id: requestId },
      data: { status: "active" },
    });
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "confirm_handover",
      entityType: "borrowing_request",
      entityId: requestId,
    },
  });

  revalidatePath(`/admin/requests/${requestId}`);
}
