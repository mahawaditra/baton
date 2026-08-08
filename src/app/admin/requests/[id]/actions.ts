"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";
import { daysBetween } from "@/lib/format";
import {
  calculateDepositRefund,
  determineInstrumentStatusOnReturn,
} from "@/lib/loan-rules";

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
  revalidatePath(`/admin/instruments`);
  revalidatePath(`/admin/instruments/${instrumentId}`);
  if (request.instrumentId)
    revalidatePath(`/admin/instruments/${request.instrumentId}`);
  revalidatePath(`/admin/dashboard`);
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
    <p>Halo ${request.borrowerName},</p>
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

  await sendEmail({
    to: request.borrowerEmail,
    subject: "Pengajuan peminjaman tidak dapat diproses.",
    html: `
    <p>Halo ${request.borrowerName},</p>
    <p>Mohon maaf, pengajuan peminjaman instrumen kamu (tiket ${request.ticketId}) tidak dapat kami proses.</p>
    <p>Alasan: ${reason}</p>
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

  revalidatePath(`/admin/requests/${requestId}`);
  if (request.instrumentId) {
    revalidatePath(`/admin/instruments`);
    revalidatePath(`/admin/instruments/${request.instrumentId}`);
    revalidatePath(`/admin/dashboard`);
  }
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
    const requestForEmail = await prisma.borrowingRequest.findUniqueOrThrow({
      where: { id: doc.period.requestId },
    });
    await sendEmail({
      to: requestForEmail.borrowerEmail,
      subject: "Dokumen ditolak — perlu direvisi",
      html: `
      <p>Halo ${requestForEmail.borrowerName},</p>
      <p>Dokumen ${doc.type} yang kamu upload ada yang perlu direvisi.</p>
      <p>Catatan admin: ${notes}</p>
       <p>Silakan upload ulang dokumen di <a href="${process.env.BETTER_AUTH_URL}/status/${requestForEmail.ticketId}">halaman status kamu</a>.</p>
      `,
    });
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

  const requestForEmail = await prisma.borrowingRequest.findUniqueOrThrow({
    where: { id: requestId },
  });
  await sendEmail({
    to: requestForEmail.borrowerEmail,
    subject: "Dokumen disetujui — siap diambil",
    html: `
    <p>Halo ${requestForEmail.borrowerName},</p>
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
  revalidatePath(`/admin/instruments`);
  revalidatePath(`/admin/instruments/${request.instrumentId}`);
  revalidatePath(`/admin/dashboard`);
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

  revalidatePath(`/admin/requests/${requestId}`);
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

  const condition = formData.get("condition") as
    | "ok"
    | "need_repair"
    | "retired"
    | "lost";

  const requestedStatus = formData.get("status") as "available" | "unavailable";
  const location = formData.get("location") as string;

  const status = determineInstrumentStatusOnReturn(condition, requestedStatus);

  const settings = await prisma.loanSetting.findFirstOrThrow();
  const actualReturnDate = new Date();
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
    <p>Halo ${request.borrowerName},</p>
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

  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath(`/admin/instruments`);
  revalidatePath(`/admin/instruments/${request.instrumentId}`);
  revalidatePath(`/admin/dashboard`);
}
