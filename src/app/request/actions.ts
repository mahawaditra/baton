"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import { getClientIp, submitRequestLimiter } from "@/lib/rate-limit";
import { generateTicketId, generateAccessCode } from "@/lib/id-generators";
import { z } from "zod";
import { REQUESTABLE_INSTRUMENT_TYPES } from "@/lib/constants";
import { escapeHtml } from "@/lib/format";
import * as Sentry from "@sentry/nextjs";

type State = {
  ticketId: string | null;
  accessCode: string | null;
  error: string | null;
  generalError: string | null;
};

const submitRequestSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100),
  email: z.email("Alamat email tidak valid"),
  phone: z.string().trim().min(1, "Nomor HP wajib diisi").max(20),
  lineId: z.string().trim().min(1, "ID LINE wajib diisi").max(20),
  instrumentType: z.enum(
    REQUESTABLE_INSTRUMENT_TYPES,
    "Pilih jenis instrumen yang valid",
  ),
  year: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Angkatan harus 4 digit angka"),
});

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
      error: null,
      generalError: "Terlalu banyak pengajuan. Coba lagi nanti.",
    };
  }

  const parsed = submitRequestSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    lineId: formData.get("lineId"),
    instrumentType: formData.get("instrumentType"),
    year: formData.get("year"),
  });

  if (!parsed.success) {
    return {
      ticketId: null,
      accessCode: null,
      error: parsed.error.issues[0].message,
      generalError: null,
    };
  }

  const { name, email, phone, lineId, instrumentType, year } = parsed.data;

  const ticketId = generateTicketId();
  const accessCode = generateAccessCode();
  const safeName = escapeHtml(name);

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

  try {
    await sendEmail({
      to: email,
      subject: `Pengajuan peminjaman diterima — tiket ${ticketId}`,
      html: `
        <p>Halo ${safeName}!</p>
        <p>Pengajuan peminjaman instrumen kamu sudah kami terima dan akan direview oleh staf Logistik OSUI.</p>
        <p>Simpan informasi berikut untuk cek status pengajuan kamu kapan saja:</p>
        <p>
          Nomor tiket: <strong>${ticketId}</strong><br/>
          Kode akses: <strong>${accessCode}</strong>
        </p>
        <p><a href="${process.env.BETTER_AUTH_URL}/status/${ticketId}">Cek status pengajuan</a></p>
      `,
    });
  } catch (error) {
    Sentry.captureException(error);
  }

  try {
    await sendEmail({
      to: process.env.GMAIL_USER!,
      subject: `Pengajuan baru masuk — tiket ${ticketId}`,
      html: `
        <p>Ada pengajuan peminjaman baru dari ${safeName}.</p>
        <p>Instrumen diminati: ${instrumentType}</p>
        <p>Mohon di-review di laman requests web.</p>
      `,
    });
  } catch (error) {
    Sentry.captureException(error);
  }

  return {
    ticketId,
    accessCode,
    error: null,
    generalError: null,
  };
}
