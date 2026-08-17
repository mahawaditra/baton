import { prisma } from "@/lib/prisma";
import { getClientIp, statusSearchLimiter } from "@/lib/rate-limit";
import { redirect } from "next/navigation";
import { Search, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/EmptyState";

export default async function StatusSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let notFound = false;
  let rateLimited = false;

  if (q) {
    const ip = await getClientIp();
    const { success } = await statusSearchLimiter.limit(`status-search:${ip}`);
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-6">
      <div className="flex flex-col items-center gap-2">
        <span className="h-2.5 w-10 rounded-full bg-gold" />
        <div className="font-heading text-h1 text-navy">BATON</div>
        <div className="text-micro uppercase text-muted-foreground">
          Cek Status Peminjaman
        </div>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Cek Status Kamu</CardTitle>
          <CardDescription>
            Masukkan Ticket ID kamu untuk lihat progres pengajuan peminjaman.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="q">Ticket ID</Label>
              <Input
                id="q"
                name="q"
                type="text"
                placeholder="mis. mW7xP2k"
                defaultValue={q ?? ""}
                required
              />
            </div>
            {notFound && (
              <div aria-live="polite">
                <EmptyState
                  icon={SearchX}
                  title="Tiket tidak ditemukan"
                  description="Coba periksa lagi Ticket ID-nya, atau cek email konfirmasi kamu."
                  tone="search"
                  size="compact"
                />
              </div>
            )}
            {rateLimited && (
              <p className="text-sm text-destructive" aria-live="polite">
                Terlalu banyak percobaan. Coba lagi beberapa menit lagi.
              </p>
            )}

            <Button type="submit" className="w-full">
              <Search className="h-4 w-4" strokeWidth={1.75} />
              Cari
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="max-w-sm text-center text-caption text-muted-foreground">
        Lupa Ticket ID-nya? Cek email konfirmasi yang kamu terima pas kirim
        pengajuan.
      </p>
    </div>
  );
}
