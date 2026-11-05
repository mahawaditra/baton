import { prisma } from "@/lib/prisma";
import { getClientIp, limitOrAllow, statusSearchLimiter } from "@/lib/rate-limit";
import { redirect } from "next/navigation";
import { ArrowRight, Clock, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TicketCard, TicketLabel } from "@/components/TicketCard";
import { HERO_INPUT_CLASS, StatusLookupShell } from "./StatusLookupShell";

export default async function StatusSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = (await searchParams).q?.trim();

  let notFound = false;
  let rateLimited = false;

  if (q) {
    const ip = await getClientIp();
    const { success } = await limitOrAllow(statusSearchLimiter, `status-search:${ip}`);
    if (!success) {
      rateLimited = true;
    } else {
      const request = await prisma.borrowingRequest.findUnique({
        where: { ticketId: q },
        select: { ticketId: true },
      });

      if (request) {
        redirect(`/status/${request.ticketId}`);
      }
      notFound = true;
    }
  }

  return (
    <StatusLookupShell
      description="Masukkan Ticket ID kamu untuk lihat progres pengajuan peminjaman."
      footnote="Lupa Ticket ID-nya? Cek email konfirmasi yang kamu terima pas kirim pengajuan."
    >
      <TicketCard
        topTone="hero"
        top={
          <form className="flex flex-col gap-3 px-6 pt-5 pb-6">
            <TicketLabel htmlFor="q">Ticket ID</TicketLabel>
            <Input
              id="q"
              name="q"
              type="text"
              inputMode="numeric"
              placeholder="mis. 26071234"
              defaultValue={q ?? ""}
              className={HERO_INPUT_CLASS}
              required
            />
            {notFound && (
              <p
                className="flex items-start gap-2 text-caption text-hero-fg/85"
                aria-live="polite"
              >
                <SearchX
                  className="mt-0.5 h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                />
                Tiket tidak ditemukan. Coba periksa lagi Ticket ID-nya, atau cek
                email konfirmasi kamu.
              </p>
            )}
            {rateLimited && (
              <p
                className="flex items-start gap-2 text-caption text-hero-fg/85"
                aria-live="polite"
              >
                <Clock className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
                Terlalu banyak percobaan. Coba lagi beberapa menit lagi.
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              className="mt-1 w-full rounded-full bg-gold text-hero-bg hover:bg-gold-hover dark:text-hero-fg"
            >
              Cari tiket
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </form>
        }
      />
    </StatusLookupShell>
  );
}
