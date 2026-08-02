"use server";

import { prisma } from "@/lib/prisma";

type VerifyResult =
  | {
      success: true;
      request: {
        ticketId: string;
        borrowerName: string;
        status: string;
        instrumentTypeRequested: string;
      };
    }
  | { success: false; error: string };

export async function verifyAccessCode(
  ticketId: string,
  code: string,
): Promise<VerifyResult> {
  const request = await prisma.borrowingRequest.findUnique({
    where: { ticketId },
    select: {
      ticketId: true,
      accessCode: true,
      borrowerName: true,
      status: true,
      instrumentTypeRequested: true,
    },
  });

  if (!request || request.accessCode !== code) {
    return { success: false, error: "Invalid ticket ID or access code" };
  }

  const { accessCode, ...safeData } = request;
  return { success: true, request: safeData };
}
