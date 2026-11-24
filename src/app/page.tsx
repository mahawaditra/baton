import Image from "next/image";
import { Check } from "lucide-react";
import { HeroMarquee } from "@/components/HeroMarquee";
import { BarlineHeading } from "@/components/BarlineHeading";
import { LandingHero } from "@/components/LandingHero";
import { LandingFaq } from "@/components/LandingFaq";
import { LandingLegacy } from "@/components/LandingLegacy";
import { LandingDesignSystem } from "@/components/LandingDesignSystem";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { getPublicContacts } from "@/lib/public-contacts";
import { PublicFooter } from "@/components/PublicFooter";
import { ContactLink, LineIcon, WhatsAppIcon } from "@/components/ContactLink";
import { ProjectLinks } from "@/components/ProjectLinks";

const STEPS = [
  {
    title: "Ajukan permintaan",
    description:
      "Isi data singkat: nama, kontak, dan instrumen yang kamu butuhkan.",
  },
  {
    title: "Tunggu konfirmasi",
    description:
      "Staf Logistik cek ketersediaan dan siapkan instrumen untuk kamu.",
  },
  {
    title: "Lengkapi & tanda tangan",
    description:
      "Isi data kontrak, unduh, tanda tangan, lalu upload dokumennya.",
  },
  {
    title: "Ambil di Sekre",
    description:
      "Catat kondisi awal, instrumen resmi jadi tanggung jawabmu.",
  },
] as const;

function stepMarkerClass(index: number) {
  if (index === 0) return "bg-primary text-background";
  if (index === STEPS.length - 1) return "bg-gold text-hero-bg";
  return "border-2 border-primary bg-background text-primary";
}

export default async function Home() {
  const { whatsappNumber, lineAddFriendUrl } = await getPublicContacts();

  return (
    <div className="min-h-screen bg-background">
      <section
        data-landing-hero
        className="relative isolate -mt-[env(safe-area-inset-top,0px)] flex min-h-[100svh] items-end justify-center overflow-hidden bg-hero-bg [clip-path:inset(0)] pt-[env(safe-area-inset-top,0px)] select-none">
        <HeroMarquee />
        <div
          aria-hidden
          className="absolute inset-0 bg-hero-bg/70 dark:bg-hero-bg/65"
        />
        <LandingHero />
      </section>

      <div className="relative isolate">
        <section className="bg-background px-6 py-12">
          <Reveal className="mx-auto max-w-7xl">
            <BarlineHeading>Cara pinjam</BarlineHeading>
            <ol className="mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-4 lg:gap-6">
              {STEPS.map((step, index) => {
                const isLast = index === STEPS.length - 1;
                return (
                  <li
                    key={step.title}
                    className="relative flex gap-4 lg:flex-col lg:items-center lg:gap-4 lg:text-center"
                  >
                    {!isLast && (
                      <span
                        aria-hidden
                        className="absolute top-11 -bottom-8 left-[21px] w-0.5 bg-gold lg:top-[21px] lg:bottom-auto lg:left-1/2 lg:h-0.5 lg:w-[calc(100%+1.5rem)]"
                      />
                    )}
                    <span
                      className={cn(
                        "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-heading text-title font-semibold ring-4 ring-background",
                        stepMarkerClass(index),
                      )}
                    >
                      {isLast ? (
                        <>
                          <Check className="h-5 w-5" strokeWidth={2} />
                          <span className="sr-only">{index + 1}</span>
                        </>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div className="min-w-0 pt-2 lg:pt-0">
                      <h3 className="text-title text-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-body text-foreground-2">
                        {step.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-10 text-center text-caption text-muted-foreground">
              Punya pertanyaan? Hubungi Ketua Logistik OSUI Mahawaditra.
            </p>
            {(whatsappNumber || lineAddFriendUrl) && (
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                {whatsappNumber && (
                  <ContactLink
                    href={`https://wa.me/${whatsappNumber}`}
                    icon={WhatsAppIcon}
                  >
                    Chat via WhatsApp
                  </ContactLink>
                )}
                {lineAddFriendUrl && (
                  <ContactLink href={lineAddFriendUrl} icon={LineIcon}>
                    Chat via LINE
                  </ContactLink>
                )}
              </div>
            )}
          </Reveal>
        </section>

        <LandingFaq />

        <LandingLegacy />

        <LandingDesignSystem />

        <section className="bg-background px-6 py-12">
          <div className="mx-auto max-w-4xl">
            <Reveal className="grid grid-cols-1 items-start gap-10 sm:grid-cols-[auto_1fr]">
              <div className="h-[140px] w-[140px] shrink-0 overflow-hidden rounded-xl bg-primary shadow-md">
                <Image
                  src="/about/haseul-loona.webp"
                  alt="haseulbintaro"
                  width={140}
                  height={140}
                  className="h-full w-full object-cover"
                />
              </div>

              <BarlineHeading className="justify-start sm:order-first sm:col-span-2 sm:justify-center">
                Why is this a thing?
              </BarlineHeading>

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
                  <ProjectLinks />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
}
