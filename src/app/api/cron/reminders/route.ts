import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import { daysBetween } from "@/lib/format";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const settings = await prisma.loanSetting.findFirstOrThrow();
  const now = new Date();

  let remindersSent = 0;
  let overdueFlipped = 0;
  let forfeitedNoticeSent = 0;

  const activeRequests = await prisma.borrowingRequest.findMany({
    where: { status: "active" },
    include: { loanPeriods: { orderBy: { sequence: "desc" }, take: 1 } },
  });

  for (const req of activeRequests) {
    const latestPeriod = req.loanPeriods[0];
    if (!latestPeriod) continue;

    const daysUntilDue = daysBetween(now, latestPeriod.dueDate);

    if (daysUntilDue === 14 || daysUntilDue === 7 || daysUntilDue === 1) {
      await sendEmail({
        to: req.borrowerEmail,
        subject: `Reminder: ${daysUntilDue} hari lagi jatuh tempo peminjaman`,
        html: `
          <p>Halo ${req.borrowerName},</p>
          <p>Peminjaman instrumen kamu (tiket ${req.ticketId}) akan jatuh tempo dalam <strong>${daysUntilDue} hari</strong> (${latestPeriod.dueDate.toLocaleDateString("id-ID")}).</p>
          <p>Sesuai Pasal 2 ayat (5) kontrak kamu, deposit dikembalikan penuh (Rp${settings.depositAmount.toLocaleString("id-ID")}) jika instrumen dikembalikan tepat waktu atau lebih awal. Telat walau 1 hari, deposit otomatis berkurang jadi Rp${settings.depositPartialAmount.toLocaleString("id-ID")} sesuai Pasal 2 ayat (6).</p>
          <p>Jika kamu masih membutuhkan instrumen tersebut, kamu bisa ajukan perpanjangan lewat <a href="${process.env.BETTER_AUTH_URL}/status/${req.ticketId}">halaman status kamu</a>.</p>
        `,
      });
      remindersSent++;
    } else if (daysUntilDue < 0) {
      await prisma.borrowingRequest.update({
        where: { id: req.id },
        data: { status: "overdue" },
      });
      await sendEmail({
        to: req.borrowerEmail,
        subject: "Peminjaman kamu sudah lewat jatuh tempo",
        html: `
          <p>Halo ${req.borrowerName},</p>
          <p>Peminjaman instrumen kamu (tiket ${req.ticketId}) sudah melewati tanggal jatuh tempo (${latestPeriod.dueDate.toLocaleDateString("id-ID")}).</p>
          <p>Sesuai Pasal 2 ayat (6) kontrak kamu, deposit yang akan dikembalikan sekarang berkurang jadi <strong>Rp${settings.depositPartialAmount.toLocaleString("id-ID")}</strong> (dari Rp${settings.depositAmount.toLocaleString("id-ID")}).</p>
          <p>Segera kembalikan instrumen dalam <strong>${settings.depositGraceDays} hari</strong> sejak jatuh tempo — lewat dari itu, sesuai Pasal 2 ayat (7), deposit tidak akan dikembalikan sama sekali.</p>
          <p><a href="${process.env.BETTER_AUTH_URL}/status/${req.ticketId}">Lihat halaman status</a></p>
        `,
      });
      overdueFlipped++;
    }
  }

  const overdueRequests = await prisma.borrowingRequest.findMany({
    where: { status: "overdue" },
    include: { loanPeriods: { orderBy: { sequence: "desc" }, take: 1 } },
  });

  for (const req of overdueRequests) {
    const latestPeriod = req.loanPeriods[0];
    if (!latestPeriod) continue;

    const daysLate = daysBetween(latestPeriod.dueDate, now);

    if (daysLate === settings.depositGraceDays + 1) {
      await sendEmail({
        to: req.borrowerEmail,
        subject: "Deposit tidak dapat dikembalikan",
        html: `
          <p>Halo ${req.borrowerName},</p>
          <p>Peminjaman instrumen kamu (tiket ${req.ticketId}) sudah terlambat lebih dari ${settings.depositGraceDays} hari sejak jatuh tempo.</p>
          <p>Sesuai Pasal 2 ayat (7) kontrak kamu, deposit <strong>tidak akan dikembalikan sama sekali</strong>.</p>
          <p>Kami tetap menunggu instrumen dikembalikan secepatnya. Hubungi staf Logistik OSUI jika ada kendala.</p>
          <p><a href="${process.env.BETTER_AUTH_URL}/status/${req.ticketId}">Lihat halaman status</a></p>
        `,
      });
      forfeitedNoticeSent++;
    }
  }

  return Response.json({ remindersSent, overdueFlipped, forfeitedNoticeSent });
}
