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
    <main className="relative z-10 flex w-full flex-col gap-8 px-10 pt-8 pb-10">
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
            className="flex w-full items-center justify-center gap-5 rounded-full border border-hero-fg/40 bg-transparent px-[clamp(36px,7cqw,72px)] text-[clamp(1.1rem,6.5cqw,2.2rem)] leading-none font-medium whitespace-nowrap text-hero-fg transition-colors hover:bg-surface/10 dark:border-hero-fg/30 dark:hover:bg-hero-fg/8"
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
            className="m-0 min-w-0 shrink-0 text-[clamp(1rem,2vw,1.75rem)] leading-none font-bold uppercase tracking-[0.02em] text-hero-fg/78"
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
            Platform peminjaman instrumen dan barang inventaris OSUI Mahawaditra
            untuk anggota aktif.
          </p>
          <span
            aria-hidden
            className="h-2.5 flex-1 rounded-full bg-gold/85 dark:bg-gold/90"
          />
        </div>
      </div>
    </main>
  );
}
