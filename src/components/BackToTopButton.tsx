"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { FixedPortal } from "@/components/FixedPortal";

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <FixedPortal>
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        tabIndex={visible ? 0 : -1}
        className={cn(
          "fixed right-6 bottom-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-navy text-background shadow-lg transition-all duration-200 hover:bg-navy-hover",
          visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <ArrowUp className="h-5 w-5" strokeWidth={2} />
      </button>
    </FixedPortal>
  );
}
