import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Clock } from "lucide-react";
import { HeroMarquee } from "@/components/HeroMarquee";
import { LandingHero } from "@/components/LandingHero";
import Link from "next/link";

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

function GithubIcon({ className }: StepIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2C6 20.94 5.34 19 5.34 19c-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.53.11-3.19 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.19.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.21.69.8.57 4.57-1.52 7.85-5.83 7.85-10.91C23.5 5.65 18.35.5 12 .5z" />
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
          <p className="mt-10 text-center text-caption text-muted-foreground">
            Punya pertanyaan? Hubungi Ketua Logistik OSUI Mahawaditra.
          </p>
          <p className="mt-2 text-center text-caption text-muted-foreground">
            If you're an admin, you can{" "}
            <Link
              href="/admin"
              className="underline underline-offset-2 font-bold hover:text-foreground"
            >
              get in here
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 items-start gap-10 sm:grid-cols-[auto_1fr]">
            <div className="h-[140px] w-[140px] shrink-0 overflow-hidden rounded-xl bg-navy shadow-md">
              <Image
                src="/about/haseul-loona.gif"
                alt="haseulbintaro"
                width={140}
                height={140}
                className="h-full w-full object-cover"
              />
            </div>

            <h2 className="font-heading text-h2 text-foreground sm:order-first sm:col-span-2 sm:text-center">
              Why is this a thing?
            </h2>

            <div className="min-w-0">
              <div className="flex flex-col gap-3.5 text-body-lg text-foreground">
                <p>
                  This site was build because for{" "}
                  <strong className="font-semibold">one</strong>, I need more
                  projects for my portfolio and{" "}
                  <strong className="font-semibold">two</strong>, I was
                  unfortunately Ketua Logistik 2023 so I know how{" "}
                  <strong className="font-semibold">messy</strong> it is even
                  after I fully reorganized the inventarisasi with such
                  meticulousness and color coding like it&apos;s a K-Pop color
                  coded lyrics video.
                </p>
                <strong className="font-semibold">
                  I can definitely assure you I didn&apos;t do this because
                  I&apos;m still somewhat attached to OSUI.
                </strong>
                <p>
                  But anyways, here it is. I hope this runs well because
                  building this was&hellip; Certainly an experience. If it does
                  not&hellip; Yaudah lah ya maap kabarin aja.
                </p>
                <p>
                  If you do have any questions regarding this web...{" "}
                  <span className="font-medium not-italic text-foreground">
                    no you don&apos;t.
                  </span>
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="h-0.5 w-8 rounded-full bg-gold"
                  />
                  <span className="font-heading text-body font-medium text-foreground">
                    ❄️ haseulbintaro
                  </span>
                </div>
                <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
                  <a
                    href="https://github.com/mahawaditra/baton"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-caption font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <GithubIcon className="h-3.5 w-3.5" />
                    mahawaditra/baton
                  </a>
                  <a
                    href="https://vanillaine.my.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-caption font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Image
                      src="/about/loonaColors.svg"
                      alt=""
                      width={14}
                      height={14}
                      className="shrink-0"
                    />
                    vanillaine.my.id
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-6 py-6 text-center text-caption text-muted-foreground">
        built with unspoken longing for a season long faded by{" "}
        <strong className="font-semibold">haseulbintaro</strong>
        <span className="mt-1 block text-micro text-foreground/5">
          #STANLOONA
        </span>
      </footer>
    </div>
  );
}
