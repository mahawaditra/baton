"use server";

import { prisma } from "@/lib/prisma";
import { customAlphabet } from "nanoid";
import { sendEmail } from "@/lib/mail";
import { getClientIp, submitRequestLimiter } from "@/lib/rate-limit";
import { generateTicketId, generateAccessCode } from "@/lib/id-generators";

type State = {
  ticketId: string | null;
  accessCode: string | null;
  error: string | null;
};

export async function submitRequest(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const ip = await getClientIp();
  const { success } = await submitRequestLimiter.limit(`submit:${ip}`);
  if (!success) {
    return {
      ticketId: null,
      accessCode: null,
      error: "Too many submissions. Try again later.",
    };
  }

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

  const ticketId = generateTicketId();
  const accessCode = generateAccessCode();

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

  await sendEmail({
    to: email,
    subject: `Pengajuan peminjaman diterima — tiket ${ticketId}`,
    html: `
      <p>Halo ${name}!</p>
      <p>Pengajuan peminjaman instrumen kamu sudah kami terima dan akan direview oleh staf Logistik OSUI.</p>
      <p>Simpan informasi berikut untuk cek status pengajuan kamu kapan saja:</p>
      <p>
        Nomor tiket: <strong>${ticketId}</strong><br/>
        Kode akses: <strong>${accessCode}</strong>
      </p>
      <p><a href="${process.env.BETTER_AUTH_URL}/status/${ticketId}">Cek status pengajuan</a></p>
    `,
  });

  await sendEmail({
    to: "perlengkapan.osui@gmail.com",
    subject: `Pengajuan baru masuk — tiket ${ticketId}`,
    html: `
      <p>Ada pengajuan peminjaman baru dari ${name}.</p>
      <p>Instrumen diminati: ${instrumentType}</p>
      <p>Mohon di-review di laman requests web.</p>
    `,
  });

  return {
    ticketId,
    accessCode,
    error: null,
  };
}
