import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { escapeHtml } from "@/lib/format";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FOOTER_TTL_MS = 60_000;

let cachedFooter: { html: string; builtAt: number } | null = null;

export function invalidateFooterCache() {
  cachedFooter = null;
}

async function buildFooter(): Promise<string> {
  if (cachedFooter !== null && Date.now() - cachedFooter.builtAt < FOOTER_TTL_MS) {
    return cachedFooter.html;
  }

  const settings = await prisma.loanSetting.findFirst();

  const contactBlock = settings
    ? `
      <p>
        Untuk informasi lebih lanjut, silakan hubungi narahubung Divisi Logistik OSUI Mahawaditra:<br/>
        ${escapeHtml(settings.signatoryName)}<br/>
        ${escapeHtml(settings.signatoryPhone)}${settings.signatoryLineId ? `<br/>LINE: ${escapeHtml(settings.signatoryLineId)}` : ""}
      </p>
    `
    : "";

  const html = `
    <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;" />
    ${contactBlock}
    <p style="color: #888888; font-size: 12px; margin-top: 16px;">--</p>
    <div style="color: #888888; font-size: 12px;">
      <p>Divisi Logistik</p>
      <p>Orkes Simfoni Universitas Indonesia Mahawaditra</p>
      <p>Pusat Kegiatan Mahasiswa Lt. Dasar</p>
      <p>Kampus UI Depok, 14624</p>
    </div>
  `;
  cachedFooter = { html, builtAt: Date.now() };
  return html;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const footer = await buildFooter();
  await transporter.sendMail({
    from: `"BATON — OSUI Mahawaditra" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: html + footer,
  });
}
