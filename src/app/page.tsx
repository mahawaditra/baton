import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Clock } from "lucide-react";
import { HeroMarquee } from "@/components/HeroMarquee";
import { LandingHero } from "@/components/LandingHero";
import { LandingFaq } from "@/components/LandingFaq";
import { prisma } from "@/lib/prisma";
import { toWhatsAppNumber } from "@/lib/format";

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

function WhatsAppIcon({ className }: StepIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.71 1.454h.006c6.585 0 11.946-5.359 11.949-11.893a11.821 11.821 0 00-3.495-8.46z" />
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

export default async function Home() {
  const settings = await prisma.loanSetting.findFirst({
    select: { signatoryPhone: true, signatoryPhonePublic: true },
  });
  const whatsappNumber =
    settings?.signatoryPhonePublic && settings.signatoryPhone
      ? toWhatsAppNumber(settings.signatoryPhone)
      : undefined;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative isolate flex min-h-screen items-end justify-center overflow-hidden bg-hero-bg">
        <HeroMarquee />
        <div
          aria-hidden
          className="absolute inset-0 bg-hero-bg/70 dark:bg-hero-bg/65"
        />
        <LandingHero />
      </section>

      <div className="relative isolate">
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
            {whatsappNumber && (
              <div className="mt-3 flex justify-center">
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-caption font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                  Chat via WhatsApp
                </a>
              </div>
            )}
          </div>
        </section>

        <LandingFaq />

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
                    This site was built because for{" "}
                    <strong className="font-semibold">one</strong>, I need
                    more projects for my portfolio and{" "}
                    <strong className="font-semibold">two</strong>, I was
                    unfortunately Ketua Logistik 2023 so I know how{" "}
                    <strong className="font-semibold">messy</strong> it is
                    even after I fully reorganized the inventarisasi with
                    such meticulousness and color coding like it&apos;s a
                    K-Pop color coded lyrics video.
                  </p>
                  <strong className="font-semibold">
                    I can definitely assure you I didn&apos;t do this because
                    I&apos;m still somewhat attached to OSUI.
                  </strong>
                  <p>
                    But anyways, here it is. I hope this runs well because
                    building this was&hellip; Certainly an experience. If it
                    does not&hellip; Yaudah lah ya maap kabarin aja.
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

        <footer className="bg-background px-6 py-6 text-center text-caption text-muted-foreground">
          built with unspoken longing for a season long faded by{" "}
          <strong className="font-semibold">haseulbintaro</strong>
          <span className="mt-1 block text-micro text-foreground/5">
            #STANLOONA
          </span>
        </footer>
      </div>
    </div>
  );
}
