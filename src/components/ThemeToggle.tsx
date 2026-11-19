"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useMounted } from "@/lib/use-mounted";
import { FixedPortal } from "@/components/FixedPortal";
import { cn } from "@/lib/utils";

const ICON_CLASS = "absolute inset-0 h-5 w-5";

function iconClass(visible: boolean, animated: boolean) {
  return cn(
    ICON_CLASS,
    !visible && "opacity-0",
    animated && (visible ? "theme-icon-in" : "theme-icon-out"),
  );
}

export function ThemeToggle() {
  const mounted = useMounted();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [animated, setAnimated] = useState(false);

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
        onClick={() => {
          setAnimated(true);
          setTheme(isDark ? "light" : "dark");
        }}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="fixed top-[calc(env(safe-area-inset-top,0px)+1.5rem)] right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-lg transition-colors hover:bg-muted"
      >
        <span aria-hidden className="relative h-5 w-5">
          <Sun className={iconClass(isDark, animated)} strokeWidth={2} />
          <Moon className={iconClass(!isDark, animated)} strokeWidth={2} />
        </span>
      </button>
    </FixedPortal>
  );
}
