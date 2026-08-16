import Link from "next/link";
import { ClipboardList, Search, Clock3, FileSignature, PackageCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DynamicWeightText } from "@/components/DynamicWeightText";
import { ScrollVelocityMarquee } from "@/components/ScrollVelocityMarquee";
import { cn } from "@/lib/utils";

const MARQUEE_TEXT = "BATON • Base for Assets, Tools, and Orchestral Needs •";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Ajukan Permintaan",
    description: "Isi data singkat: nama, kontak, dan instrumen yang kamu butuhkan.",
  },
  {
    icon: Clock3,
    title: "Tunggu Konfirmasi",
    description: "Admin Logistik cek ketersediaan dan siapkan instrumen buat kamu.",
  },
  {
    icon: FileSignature,
    title: "Lengkapi & Tanda Tangan",
    description: "Isi data kontrak, unduh, tanda tangan, lalu upload dokumennya.",
  },
  {
    icon: PackageCheck,
    title: "Ambil di Sekre",
    description:
      "Serahkan dokumen, catat kondisi awal, instrumen resmi jadi tanggung jawabmu.",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy pt-24">
        <div aria-hidden className="absolute inset-0">
          <ScrollVelocityMarquee
            text={MARQUEE_TEXT}
            className="font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-bold text-background/25"
          />
        </div>
        <div aria-hidden className="absolute inset-0 bg-navy/70" />

        <main className="relative z-10 w-full px-8 py-8 md:px-16">
          <div className="flex flex-col items-start gap-10 md:flex-row md:items-start md:justify-between">
            <h1>
              <DynamicWeightText
                text="BATON"
                className="font-heading text-[clamp(6rem,42vh,26rem)] leading-none tracking-tight text-background"
              />
            </h1>

            <div className="mt-6 flex shrink-0 flex-col gap-4">
              <Link
                href="/request"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-auto rounded-full bg-gold px-10 py-8 text-2xl text-navy hover:bg-gold-hover",
                )}
              >
                <ClipboardList className="h-7 w-7" strokeWidth={1.75} />
                Ajukan Peminjaman
              </Link>
              <Link
                href="/status"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-auto rounded-full border-background/40 bg-transparent px-10 py-8 text-2xl text-background hover:bg-background/10 hover:text-background",
                )}
              >
                <Search className="h-7 w-7" strokeWidth={1.75} />
                Cek Status Peminjaman
              </Link>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-5">
            <div className="flex items-center gap-6">
              <p className="min-w-0 text-[clamp(1.5rem,4.2vh,3rem)] leading-none font-semibold uppercase tracking-widest text-background/70">
                Base for Assets, Tools, and Orchestral Needs
              </p>
              <span
                aria-hidden
                className="h-2 flex-1 rounded-full bg-gold/80"
              />
            </div>
            <div className="flex items-center gap-6">
              <p className="min-w-0 text-[clamp(1.25rem,3.2vh,2.375rem)] leading-tight text-background/85">
                Platform peminjaman instrumen dan barang inventaris OSUI
                Mahawaditra untuk anggota aktif.
              </p>
              <span
                aria-hidden
                className="h-2 flex-1 rounded-full bg-gold/80"
              />
            </div>
          </div>
        </main>
      </section>

      <section className="border-t border-border bg-surface px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-heading text-h2 text-foreground">
            Cara Pinjam
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.title}>
                  <CardContent>
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-background">
                        {index + 1}
                      </span>
                      <Icon
                        className="h-5 w-5 text-navy"
                        strokeWidth={1.75}
                      />
                    </div>
                    <h3 className="mt-3 text-title text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-body text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-caption text-muted-foreground">
        Punya pertanyaan? Hubungi Ketua Logistik OSUI Mahawaditra.
      </footer>
    </div>
  );
}
