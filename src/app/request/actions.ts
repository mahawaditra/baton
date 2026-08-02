"use server";

import { prisma } from "@/lib/prisma";
import { customAlphabet } from "nanoid";

const ticketIdGen = customAlphabet(
  "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz",
  7,
);
const accessCodeGen = customAlphabet("23456789ABCDEFGHJKMNPQRSTUVWXYZ", 6);

type State = {
  ticketId: string | null;
  accessCode: string | null;
  error: string | null;
};

export async function submitRequest(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const lineId = formData.get("lineId") as string;
  const instrumentType = formData.get("instrumentType") as string;
  const year = formData.get("year") as string;

  if (!name || !email || !phone || !lineId || !instrumentType || !year) {
    return {
      ticketId: null,
      accessCode: null,
      error: "All fields are required",
    };
  }

  const ticketId = ticketIdGen();
  const accessCode = accessCodeGen();

  await prisma.borrowingRequest.create({
    data: {
      ticketId,
      accessCode,
      instrumentTypeRequested: instrumentType,
      borrowerName: name,
      borrowerEmail: email,
      borrowerPhone: phone,
      borrowerLineId: lineId,
      borrowerYear: year,
    },
  });

  return {
    ticketId,
    accessCode,
    error: null,
  };
}
