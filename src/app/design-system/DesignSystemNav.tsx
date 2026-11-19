"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "./nav-groups";

const SECTION_IDS = NAV_GROUPS.flatMap((group) =>
  group.items.map((item) => item.id),
);

function useActiveSection() {
  const [active, setActive] = useState<string>(SECTION_IDS[0]);

  useEffect(() => {
    const visible = new Set<string>();
    const lastId = SECTION_IDS[SECTION_IDS.length - 1];

    function resolve() {
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      const first = atBottom
        ? lastId
        : SECTION_IDS.find((id) => visible.has(id));
      if (first) setActive(first);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        resolve();
      },
      { rootMargin: "-20% 0px -55% 0px" },
    );
    for (const id of SECTION_IDS) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    let frame = 0;
    function handleScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        resolve();
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return active;
}

const ActiveSectionContext = createContext<string>(SECTION_IDS[0]);

export function ActiveSectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const active = useActiveSection();
  return <ActiveSectionContext value={active}>{children}</ActiveSectionContext>;
}

export function DesignSystemChips() {
  const active = useContext(ActiveSectionContext);
  const chipsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = chipsRef.current;
    const chip = container?.querySelector<HTMLElement>(
      `[data-section="${active}"]`,
    );
    if (!container || !chip || container.offsetParent === null) return;
    const { paddingLeft, paddingRight } = getComputedStyle(container);
    const visibleCenter =
      (parseFloat(paddingLeft) +
        container.clientWidth -
        parseFloat(paddingRight)) /
      2;
    const left = chip.offsetLeft + chip.offsetWidth / 2 - visibleCenter;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    container.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
  }, [active]);

  return (
    <div className="sticky top-0 z-20 -mx-6 bg-background/95 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] pb-2.5 backdrop-blur-sm lg:hidden">
      <nav
        ref={chipsRef}
        aria-label="Design system sections"
        className="relative flex h-11 items-center gap-2 overflow-x-auto pr-28 pl-6 [mask-image:linear-gradient(to_right,transparent,#000_1.25rem,#000_calc(100%-7rem),transparent_calc(100%-5rem))] [scrollbar-width:none]"
      >
        {NAV_GROUPS.flatMap((group) => group.items).map((item) => {
          const isActive = item.id === active;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              data-section={item.id}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-caption transition-colors duration-200 motion-reduce:transition-none",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-foreground-2",
              )}
            >
              {item.title}
            </a>
          );
        })}
      </nav>
    </div>
  );
}

export function DesignSystemNav() {
  const active = useContext(ActiveSectionContext);

  return (
    <nav
      aria-label="Design system sections"
      className="sticky top-6 hidden max-h-[calc(100svh-3rem)] self-start overflow-y-auto pr-2 lg:block"
    >
      <ol className="flex flex-col gap-5">
        {NAV_GROUPS.map((group) => {
          const groupActive = group.items.some((item) => item.id === active);
          return (
            <li key={group.id} className="flex flex-col gap-1.5">
              <a
                href={`#${group.id}`}
                className={cn(
                  "text-micro uppercase transition-colors duration-200",
                  groupActive
                    ? "text-gold-soft-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {group.title}
              </a>
              <ol className="flex flex-col border-l border-border">
                {group.items.map((item) => {
                  const isActive = item.id === active;
                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        aria-current={isActive ? "location" : undefined}
                        className={cn(
                          "-ml-px block border-l-2 py-1 pl-3 text-sm transition-[color,border-color] duration-200 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
                          isActive
                            ? "border-gold font-medium text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {item.title}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
