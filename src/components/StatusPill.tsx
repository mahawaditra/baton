import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusPillTone = { bg: string; fg: string; dot: string };

export function StatusPill({
  tone,
  variant = "chip",
  children,
}: {
  tone: StatusPillTone;
  variant?: "chip" | "pill";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap px-2 text-micro uppercase",
        variant === "pill" ? "rounded-full" : "rounded-sm",
        tone.bg,
        tone.fg,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
      {children}
    </span>
  );
}
