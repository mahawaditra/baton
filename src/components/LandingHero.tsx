"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ClipboardList, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const HERO_BUTTON_CLASS =
  "flex w-full items-center justify-center gap-[0.55em] rounded-full px-(--hero-button-pad) text-[length:clamp(1rem,calc((100cqw_-_2*var(--hero-button-pad))/15.5),2.2rem)] leading-none whitespace-nowrap transition-colors";

const GOLD_FILL = "bg-gold/85 dark:bg-gold/90";

const STAFF_LINES = 5;
const STAFF_LINE_WIDTH = 2;
const STAFF_FADE_ID = "hero-staff-fade";
const STAFF_FADE_BLUR = { x: 36, y: 14 };
const STAFF_FADE_PAD = { x: 72, between: 14, outer: 42 };

function textRect(element: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect();
}

function GoldStaff({ ref }: { ref: React.Ref<SVGSVGElement> }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <svg
        ref={ref}
        className="invisible absolute inset-0 h-full w-full overflow-visible text-gold/85 dark:text-gold/90"
      >
        <defs>
          <filter
            id={`${STAFF_FADE_ID}-blur`}
            filterUnits="userSpaceOnUse"
            x="-25%"
            y="-100%"
            width="150%"
            height="300%"
          >
            <feGaussianBlur
              stdDeviation={`${STAFF_FADE_BLUR.x} ${STAFF_FADE_BLUR.y}`}
            />
          </filter>
          <mask
            id={STAFF_FADE_ID}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="100%"
            height="100%"
          >
            <rect width="100%" height="100%" fill="white" />
            <g filter={`url(#${STAFF_FADE_ID}-blur)`} fill="black">
              <rect data-staff-shadow />
              <rect data-staff-shadow />
            </g>
          </mask>
        </defs>
        <g mask={`url(#${STAFF_FADE_ID})`} fill="currentColor">
          {Array.from({ length: STAFF_LINES }, (_, index) => (
            <rect
              key={index}
              data-staff-line
              width="100%"
              height={STAFF_LINE_WIDTH}
            />
          ))}
        </g>
      </svg>
      <span className="absolute inset-y-0 right-0 flex gap-1">
        <span className={cn("w-0.5", GOLD_FILL)} />
        <span className={cn("w-2", GOLD_FILL)} />
      </span>
    </span>
  );
}

export function LandingHero() {
  const wordmarkRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const staffRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const wordmarkEl = wordmarkRef.current;
    const taglineEl = taglineRef.current;
    const descriptionEl = descriptionRef.current;
    const staffEl = staffRef.current;
    if (!wordmarkEl || !taglineEl || !descriptionEl || !staffEl) return;

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

    function placeStaffLines() {
      if (!taglineEl || !descriptionEl || !staffEl) return;
      const staff = staffEl.getBoundingClientRect();
      if (staff.width === 0) return;
      const step = (staff.height - STAFF_LINE_WIDTH) / (STAFF_LINES - 1);
      staffEl
        .querySelectorAll("[data-staff-line]")
        .forEach((line, index) => line.setAttribute("y", `${index * step}`));

      const shadows = staffEl.querySelectorAll("[data-staff-shadow]");
      [taglineEl, descriptionEl].forEach((textEl, index) => {
        const text = textRect(textEl);
        const shadow = shadows[index];
        if (!shadow) return;
        const padTop =
          index === 0 ? STAFF_FADE_PAD.outer : STAFF_FADE_PAD.between;
        const padBottom =
          index === 0 ? STAFF_FADE_PAD.between : STAFF_FADE_PAD.outer;
        shadow.setAttribute(
          "x",
          `${text.left - staff.left - STAFF_FADE_PAD.x}`,
        );
        shadow.setAttribute("y", `${text.top - staff.top - padTop}`);
        shadow.setAttribute("width", `${text.width + 2 * STAFF_FADE_PAD.x}`);
        shadow.setAttribute("height", `${text.height + padTop + padBottom}`);
      });
      staffEl.style.visibility = "visible";
    }

    function syncWidth() {
      if (!wordmarkEl) return;
      const width = wordmarkEl.getBoundingClientRect().width;
      if (width > 0) justify(width);
      placeStaffLines();
    }

    let frame = requestAnimationFrame(syncWidth);
    function scheduleSync() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncWidth);
    }

    window.addEventListener("resize", scheduleSync);
    document.fonts?.ready.then(scheduleSync);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", scheduleSync);
    };
  }, []);

  return (
    <>
      <div className="absolute top-[calc(env(safe-area-inset-top,0px)+1.5rem)] right-20 left-6 z-10 lg:hidden">
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
                strokeWidth={2}
              />
              Ajukan peminjaman
            </Link>
            <Link
              href="/status"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-hero-fg/40 bg-transparent text-sm font-medium whitespace-nowrap text-hero-fg uppercase transition-colors hover:bg-surface/10 dark:border-hero-fg/30 dark:hover:bg-hero-fg/8"
            >
              <Search className="h-5 w-5 shrink-0" strokeWidth={2} />
              Cek status peminjaman
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

            <div className="grid h-full min-w-0 grid-rows-2 gap-5 [--hero-button-pad:clamp(1.5rem,8cqw,4.5rem)] [container-type:inline-size]">
              <Link
                href="/request"
                className={cn(
                  HERO_BUTTON_CLASS,
                  "bg-gold font-semibold text-hero-bg shadow-hero-btn hover:bg-gold-hover",
                )}
              >
                <ClipboardList
                  className="h-[1.4em] w-[1.4em] shrink-0"
                  strokeWidth={2}
                />
                AJUKAN PEMINJAMAN
              </Link>
              <Link
                href="/status"
                className={cn(
                  HERO_BUTTON_CLASS,
                  "border border-hero-fg/40 bg-transparent font-medium text-hero-fg hover:bg-surface/10 dark:border-hero-fg/30 dark:hover:bg-hero-fg/8",
                )}
              >
                <Search
                  className="h-[1.4em] w-[1.4em] shrink-0"
                  strokeWidth={2}
                />
                CEK STATUS PEMINJAMAN
              </Link>
            </div>
          </div>

          <div className="relative flex flex-col gap-4">
            <p
              ref={taglineRef}
              className="m-0 self-start text-[clamp(1rem,2vw,1.75rem)] leading-none font-bold tracking-[0.02em] text-hero-fg/78 uppercase"
            >
              Base (for) Assets X Tools X Orchestral Needs
            </p>
            <p
              ref={descriptionRef}
              className="m-0 max-w-[calc(100%-10rem)] text-[clamp(0.875rem,1.5vw,1.4rem)] leading-[1.25] font-medium text-hero-fg/90"
            >
              Platform peminjaman instrumen dan barang inventaris OSUI
              Mahawaditra untuk anggota aktif.
            </p>
            <GoldStaff ref={staffRef} />
          </div>
        </div>
      </main>
    </>
  );
}
