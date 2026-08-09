"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendEmail } from "@/lib/mail";
import { daysBetween, escapeHtml, toJakartaCalendarDate } from "@/lib/format";
import {
  calculateDepositRefund,
  determineInstrumentStatusOnReturn,
} from "@/lib/loan-rules";
import { revalidateRequestViews } from "@/lib/revalidate";
import { z } from "zod";

const confirmReturnSchema = z.object({
  condition: z.enum(
    ["ok", "need_repair", "retired", "lost"],
    "Invalid condition value",
  ),
  status: z.enum(["available", "unavailable"], "Invalid status value"),
  location: z.string().trim().min(1, "Location is required").max(100),
});

const documentDecisionSchema = z.enum(
  ["approved", "rejected"],
  "Invalid document decision value",
);

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
    const instrument = await tx.instrument.findUniqueOrThrow({
      where: { id: instrumentId },
    });

    if (
      instrument.status !== "available" ||
      !instrument.isLoanable ||
      !["ok", "need_repair"].includes(instrument.condition)
    ) {
      throw new Error("This instrument is no longer available to assign.");
    }

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

  revalidateRequestViews(requestId, {
    instrumentIds: [instrumentId, request.instrumentId],
  });
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
  await sendEmail({
    to: request.borrowerEmail,
    subject: "Instrumen tersedia — lengkapi data kontrak",
    html: `
    <p>Halo ${escapeHtml(request.borrowerName)},</p>
    <p>Instrumen yang kamu ajukan sekarang tersedia.</p>
    <p>Silakan lengkapi data kontrak di link berikut:</p>
    <p><a href="${process.env.BETTER_AUTH_URL}/status/${request.ticketId}">Lanjut ke Tahap 2</a></p>
  `,
  });
  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "notify_available",
      entityType: "borrowing_request",
      entityId: requestId,
      metadata: { notifiedEmail: request.borrowerEmail },
    },
  });

  revalidateRequestViews(requestId);
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

  await sendEmail({
    to: request.borrowerEmail,
    subject: "Pengajuan peminjaman tidak dapat diproses.",
    html: `
    <p>Halo ${escapeHtml(request.borrowerName)},</p>
    <p>Mohon maaf, pengajuan peminjaman instrumen kamu (tiket ${request.ticketId}) tidak dapat kami proses.</p>
    <p>Alasan: ${escapeHtml(reason)}</p>
    <p>Silakan hubungi staf Logistik OSUI untuk solusi lebih lanjut.</p>
  `,
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "reject_request",
      entityType: "borrowing_request",
      entityId: requestId,
      metadata: { reason, releasedInstrumentId: request.instrumentId },
    },
  });

  revalidateRequestViews(requestId, { instrumentIds: [request.instrumentId] });
}

export async function submitDocumentReview(
  requestId: string,
  formData: FormData,
) {
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
    where: { periodId: latestPeriod.id, reviewStatus: "pending" },
    distinct: ["type"],
    orderBy: { uploadedAt: "desc" },
  });

  if (documents.length === 0) {
    throw new Error("No pending documents to review.");
  }

  const decisions = documents.map((doc) => {
    const parsedDecision = documentDecisionSchema.safeParse(
      formData.get(`decision_${doc.id}`),
    );
    if (!parsedDecision.success) {
      throw new Error(`Missing decision for ${doc.type}.`);
    }
    const decision = parsedDecision.data;

    const notesRaw = formData.get(`notes_${doc.id}`);
    const notes =
      typeof notesRaw === "string" && notesRaw.trim() ? notesRaw.trim() : null;

    if (decision === "rejected" && !notes) {
      throw new Error(`Rejection reason is required for ${doc.type}.`);
    }

    return { id: doc.id, type: doc.type, decision, notes };
  });

  await prisma.$transaction(
    decisions.map((d) =>
      prisma.document.update({
        where: { id: d.id },
        data: {
          reviewStatus: d.decision,
          reviewerNotes: d.notes,
          reviewedAt: new Date(),
        },
      }),
    ),
  );

  const rejected = decisions.filter((d) => d.decision === "rejected");

  if (rejected.length > 0) {
    await prisma.borrowingRequest.update({
      where: { id: requestId },
      data: { status: "contract_generated" },
    });

    const requestForEmail = await prisma.borrowingRequest.findUniqueOrThrow({
      where: { id: requestId },
    });

    const introText =
      rejected.length === 1
        ? "Dokumen berikut yang kamu upload perlu direvisi:"
        : "Beberapa dokumen berikut yang kamu upload perlu direvisi:";

    await sendEmail({
      to: requestForEmail.borrowerEmail,
      subject: "Dokumen ditolak — perlu direvisi",
      html: `
      <p>Halo ${escapeHtml(requestForEmail.borrowerName)},</p>
      <p>${introText}</p>
      <ul>
        ${rejected
          .map(
            (d) =>
              `<li><strong>${escapeHtml(d.type)}</strong>: ${escapeHtml(d.notes!)}</li>`,
          )
          .join("")}
      </ul>
      <p>Silakan upload ulang dokumen di <a href="${process.env.BETTER_AUTH_URL}/status/${requestForEmail.ticketId}">halaman status kamu</a>.</p>
      `,
    });
  }

  await prisma.activityLog.createMany({
    data: decisions.map((d) => ({
      adminId: session.user.id,
      action:
        d.decision === "approved" ? "approve_documents" : "reject_documents",
      entityType: "borrowing_request",
      entityId: requestId,
      metadata: { documentId: d.id, type: d.type, notes: d.notes },
    })),
  });

  revalidateRequestViews(requestId);
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

  const requestForEmail = await prisma.borrowingRequest.findUniqueOrThrow({
    where: { id: requestId },
  });
  await sendEmail({
    to: requestForEmail.borrowerEmail,
    subject: "Dokumen disetujui — siap diambil",
    html: `
    <p>Halo ${escapeHtml(requestForEmail.borrowerName)},</p>
    <p>Dokumen kamu sudah disetujui dan instrumen sudah siap diambil di Sekre atau Pusgiwa UI!</p>
    <p>Staf Logistik OSUI akan menghubungi kamu untuk koordinasi waktu pengambilan. Jika dalam waktu dekat belum ada kabar, kamu bisa menghubungi staf Logistik OSUI langsung melalui LINE.</p>
    <p><a href="${process.env.BETTER_AUTH_URL}/status/${requestForEmail.ticketId}">Lihat halaman status</a> untuk mengisi addendum setelah menerima instrumen.</p>
    `,
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "confirm_ready",
      entityType: "borrowing_request",
      entityId: requestId,
    },
  });

  revalidateRequestViews(requestId);
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

  revalidateRequestViews(requestId, { instrumentIds: [request.instrumentId] });
}

export async function confirmExtension(requestId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not logged in");
  }

  const latestPeriod = await prisma.loanPeriod.findFirst({
    where: { requestId },
    orderBy: { sequence: "desc" },
  });
  if (!latestPeriod || latestPeriod.periodType !== "extension") {
    throw new Error("No pending extension period found.");
  }

  const addendum = await prisma.addendum.findFirst({
    where: { periodId: latestPeriod.id, timing: "initial" },
  });
  if (!addendum) {
    throw new Error("Borrower has not submitted the initial addendum yet.");
  }

  await prisma.loanPeriod.update({
    where: { id: latestPeriod.id },
    data: { startDate: new Date() },
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "confirm_extension",
      entityType: "borrowing_request",
      entityId: requestId,
    },
  });

  revalidateRequestViews(requestId);
}

export async function confirmReturn(requestId: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not logged in");
  }

  const request = await prisma.borrowingRequest.findUniqueOrThrow({
    where: { id: requestId },
  });
  if (
    (request.status !== "active" && request.status !== "overdue") ||
    !request.instrumentId
  ) {
    throw new Error("Request is not active.");
  }

  const latestPeriod = await prisma.loanPeriod.findFirst({
    where: { requestId },
    orderBy: { sequence: "desc" },
  });
  if (!latestPeriod) {
    throw new Error("No loan period found for this request.");
  }

  const finalAddendum = await prisma.addendum.findFirst({
    where: { periodId: latestPeriod.id, timing: "final" },
  });
  if (!finalAddendum) {
    throw new Error("Borrower has not submitted the final addendum yet.");
  }

  const parsed = confirmReturnSchema.safeParse({
    condition: formData.get("condition"),
    status: formData.get("status"),
    location: formData.get("location"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { condition, status: requestedStatus, location } = parsed.data;

  const status = determineInstrumentStatusOnReturn(condition, requestedStatus);

  const settings = await prisma.loanSetting.findFirstOrThrow();
  const actualReturnDate = toJakartaCalendarDate(finalAddendum.submittedAt);
  const daysLate = daysBetween(latestPeriod.dueDate, actualReturnDate);

  const depositRefundAmount = calculateDepositRefund({
    daysLate,
    depositAmount: settings.depositAmount,
    depositGraceDays: settings.depositGraceDays,
    depositPartialAmount: settings.depositPartialAmount,
  });

  await prisma.$transaction([
    prisma.loanPeriod.update({
      where: { id: latestPeriod.id },
      data: { actualReturnDate },
    }),
    prisma.borrowingRequest.update({
      where: { id: requestId },
      data: { status: "returned", depositRefundAmount },
    }),
    prisma.instrument.update({
      where: { id: request.instrumentId },
      data: { condition, status, location },
    }),
  ]);

  const depositMessage =
    depositRefundAmount > 0
      ? `<p>Deposit yang akan dikembalikan: <strong>Rp${depositRefundAmount.toLocaleString("id-ID")}</strong>. Staf Logistik OSUI akan menghubungi kamu untuk proses transfer balik.</p>`
      : `<p>Berdasarkan tanggal pengembalian, deposit yang kamu setorkan tidak dapat dikembalikan sesuai ketentuan peminjaman.</p>`;

  await sendEmail({
    to: request.borrowerEmail,
    subject: "Pengembalian dikonfirmasi — terima kasih!",
    html: `
    <p>Halo ${escapeHtml(request.borrowerName)},</p>
    <p>Pengembalian instrumen kamu sudah dikonfirmasi. Terima kasih sudah mengembalikan instrumennya!</p>
    ${depositMessage}
    `,
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "confirm_return",
      entityType: "borrowing_request",
      entityId: requestId,
      metadata: { condition, status, depositRefundAmount, daysLate },
    },
  });

  revalidateRequestViews(requestId, {
    instrumentIds: [request.instrumentId],
    archive: true,
  });
}
