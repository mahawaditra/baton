"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ClipboardList, Search } from "lucide-react";

export function LandingHero() {
  const wordmarkRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const wordmarkEl = wordmarkRef.current;
    const taglineEl = taglineRef.current;
    if (!wordmarkEl || !taglineEl) return;

    function justify(width: number) {
      if (!taglineEl) return;
      taglineEl.style.wordSpacing = "0";
      taglineEl.style.width = "auto";
      const natural = taglineEl.getBoundingClientRect().width;
      taglineEl.style.width = `${width}px`;
      const words = (taglineEl.textContent ?? "").trim().split(/\s+/).length;
      const gaps = words - 1;
      if (gaps > 0 && natural < width) {
        taglineEl.style.wordSpacing = `${(width - natural) / gaps}px`;
      } else {
        taglineEl.style.wordSpacing = "0";
      }
    }

    function syncWidth() {
      if (!wordmarkEl) return;
      const width = wordmarkEl.getBoundingClientRect().width;
      if (width > 0) justify(width);
    }

    requestAnimationFrame(syncWidth);
    window.addEventListener("resize", syncWidth);
    document.fonts?.ready.then(syncWidth);

    return () => window.removeEventListener("resize", syncWidth);
  }, []);

  return (
    <>
      <div className="absolute top-6 right-20 left-6 z-10 lg:hidden">
        <p className="m-0 text-body-lg tracking-[0.06em] text-hero-fg/75 uppercase">
          Base (for) Assets X Tools X Orchestral Needs
        </p>
        <span
          aria-hidden
          className="mt-2 block h-0.5 w-12 rounded-full bg-gold/85"
        />
        <p className="mt-2 text-caption text-hero-fg/90">
          Platform peminjaman instrumen dan barang inventaris OSUI
          Mahawaditra untuk anggota aktif.
        </p>
      </div>

      <main className="relative z-10 flex w-full flex-col gap-8 px-6 pt-8 pb-10 lg:px-10">
        <div className="flex flex-1 flex-col justify-center gap-8 lg:hidden">
          <h1 className="m-0 leading-[0.85]">
            <span className="inline-block font-heading text-[clamp(4.5rem,22vw,7rem)] font-bold tracking-[-0.03em] text-hero-fg">
              BATON
            </span>
          </h1>

          <div className="flex flex-col gap-3">
            <Link
              href="/request"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-gold text-sm font-semibold whitespace-nowrap text-hero-bg uppercase shadow-hero-btn transition-colors hover:bg-gold-hover"
            >
              <ClipboardList
                className="h-5 w-5 shrink-0"
                strokeWidth={1.75}
              />
              Ajukan Peminjaman
            </Link>
            <Link
              href="/status"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-hero-fg/40 bg-transparent text-sm font-medium whitespace-nowrap text-hero-fg uppercase transition-colors hover:bg-surface/10 dark:border-hero-fg/30 dark:hover:bg-hero-fg/8"
            >
              <Search className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              Cek Status Peminjaman
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex lg:flex-col lg:gap-8">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-stretch gap-10">
            <h1 className="m-0 leading-[0.82]">
              <span
                ref={wordmarkRef}
                className="-ml-[0.05em] inline-block font-heading text-[clamp(7rem,18vw,27rem)] leading-[0.82] font-bold tracking-[-0.04em] text-hero-fg"
              >
                BATON
              </span>
            </h1>

            <div className="grid h-full min-w-0 grid-rows-2 gap-5 [container-type:inline-size]">
              <Link
                href="/request"
                className="flex w-full items-center justify-center gap-5 rounded-full bg-gold px-[clamp(36px,7cqw,72px)] text-[clamp(1.1rem,6.5cqw,2.2rem)] leading-none font-semibold whitespace-nowrap text-hero-bg shadow-hero-btn transition-colors hover:bg-gold-hover"
              >
                <ClipboardList
                  className="h-[1.4em] w-[1.4em] shrink-0"
                  strokeWidth={1.75}
                />
                AJUKAN PEMINJAMAN
              </Link>
              <Link
                href="/status"
                className="flex w-full items-center justify-center gap-5 rounded-full border border-hero-fg/40 bg-transparent text-[clamp(1.1rem,6.5cqw,2.2rem)] leading-none font-medium whitespace-nowrap text-hero-fg transition-colors hover:bg-surface/10 dark:border-hero-fg/30 dark:hover:bg-hero-fg/8"
              >
                <Search
                  className="h-[1.4em] w-[1.4em] shrink-0"
                  strokeWidth={1.75}
                />
                CEK STATUS PEMINJAMAN
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-8">
              <p
                ref={taglineRef}
                className="m-0 min-w-0 shrink-0 text-[clamp(1rem,2vw,1.75rem)] leading-none font-bold tracking-[0.02em] text-hero-fg/78 uppercase"
              >
                Base (for) Assets X Tools X Orchestral Needs
              </p>
              <span
                aria-hidden
                className="h-2.5 flex-1 rounded-full bg-gold/85 dark:bg-gold/90"
              />
            </div>
            <div className="flex items-center gap-8">
              <p className="m-0 min-w-0 text-[clamp(0.875rem,1.5vw,1.4rem)] leading-[1.25] font-medium text-hero-fg/90">
                Platform peminjaman instrumen dan barang inventaris OSUI
                Mahawaditra untuk anggota aktif.
              </p>
              <span
                aria-hidden
                className="h-2.5 flex-1 rounded-full bg-gold/85 dark:bg-gold/90"
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
