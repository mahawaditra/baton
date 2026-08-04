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
