import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Clock } from "lucide-react";
import { HeroMarquee } from "@/components/HeroMarquee";
import { LandingHero } from "@/components/LandingHero";

type StepIconProps = { className?: string; strokeWidth?: number };

function SignatureIcon({ className, strokeWidth = 1.75 }: StepIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 19.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9.5" />
      <path d="M9 4v18" />
      <path d="M14 22 4 12" />
      <path d="m22 22-5-5" />
      <path d="M17 22v-4h4" />
    </svg>
  );
}

function PickupIcon({ className, strokeWidth = 1.75 }: StepIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 16 8 8" />
      <path d="m16 8-8 8" />
      <path d="M21 10V6a2 2 0 0 0-2-2h-4" />
      <path d="M3 10V6a2 2 0 0 1 2-2h4" />
      <path d="M21 14v4a2 2 0 0 1-2 2h-4" />
      <path d="M3 14v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

const STEPS = [
  {
    icon: ClipboardList,
    title: "Ajukan Permintaan",
    description:
      "Isi data singkat: nama, kontak, dan instrumen yang kamu butuhkan.",
  },
  {
    icon: Clock,
    title: "Tunggu Konfirmasi",
    description:
      "Admin Logistik cek ketersediaan dan siapkan instrumen untuk kamu.",
  },
  {
    icon: SignatureIcon,
    title: "Lengkapi & Tanda Tangan",
    description:
      "Isi data kontrak, unduh, tanda tangan, lalu upload dokumennya.",
  },
  {
    icon: PickupIcon,
    title: "Ambil di Sekre",
    description:
      "Serahkan dokumen, catat kondisi awal, instrumen resmi jadi tanggung jawabmu.",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative flex min-h-screen items-end justify-center overflow-hidden bg-hero-bg">
        <HeroMarquee />
        <div
          aria-hidden
          className="absolute inset-0 bg-hero-bg/70 dark:bg-hero-bg/65"
        />
        <LandingHero />
      </section>

      <section className="border-t border-border bg-surface px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center font-heading text-h2 text-foreground">
            Cara Pinjam
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative">
                  <span className="absolute -top-2.5 -left-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-bold text-background shadow-sm">
                    {index + 1}
                  </span>
                  <Card size="sm">
                    <CardContent>
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className="h-5 w-5 text-navy"
                          strokeWidth={1.75}
                        />
                        <h3 className="text-title text-foreground">
                          {step.title}
                        </h3>
                      </div>
                      <p className="mt-3 text-body text-muted-foreground">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
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
