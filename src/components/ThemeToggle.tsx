"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useMounted } from "@/lib/use-mounted";
import { FixedPortal } from "@/components/FixedPortal";

export function ThemeToggle() {
  const mounted = useMounted();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  if (
    !mounted ||
    pathname.startsWith("/legacy") ||
    pathname.startsWith("/limbo")
  ) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <FixedPortal>
      <button
        type="button"
        data-theme-toggle
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="fixed top-[calc(env(safe-area-inset-top,0px)+1.5rem)] right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-lg transition-colors hover:bg-muted"
      >
        {isDark ? (
          <Sun className="h-5 w-5" strokeWidth={2} />
        ) : (
          <Moon className="h-5 w-5" strokeWidth={2} />
        )}
      </button>
    </FixedPortal>
  );
}
