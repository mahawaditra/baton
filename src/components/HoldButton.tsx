"use client";

import { useEffect, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DRAIN_MS = 200;
const CONFIRM_KEYS = [" ", "Enter"];

type HoldButtonProps = {
  label: string;
  holdingLabel: string;
  pendingLabel: string;
  pending: boolean;
  disabled?: boolean;
  holdMs?: number;
  size?: "default" | "lg";
  className?: string;
  canStart?: () => boolean;
  onConfirm: () => void;
};

export function HoldButton({
  label,
  holdingLabel,
  pendingLabel,
  pending,
  disabled = false,
  holdMs = 2000,
  size = "default",
  className,
  canStart,
  onConfirm,
}: HoldButtonProps) {
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  function start() {
    if (disabled || pending || timerRef.current !== null) return;
    if (canStart && !canStart()) return;

    setHolding(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setHolding(false);
      onConfirm();
    }, holdMs);
  }

  function cancel() {
    if (timerRef.current === null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
    setHolding(false);
  }

  const filled = holding || pending;
  const currentLabel = pending ? pendingLabel : holding ? holdingLabel : label;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-busy={pending}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        start();
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onPointerLeave={cancel}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (!CONFIRM_KEYS.includes(event.key)) return;
        event.preventDefault();
        if (!event.repeat) start();
      }}
      onKeyUp={(event) => {
        if (CONFIRM_KEYS.includes(event.key)) cancel();
      }}
      onBlur={cancel}
      className={cn(
        buttonVariants({ variant: "outline", size }),
        "relative overflow-hidden border-destructive/40 bg-destructive-soft px-5 font-semibold text-destructive shadow-none [-webkit-touch-callout:none] hover:bg-destructive-soft hover:text-destructive dark:border-destructive/40 dark:bg-destructive-soft dark:hover:bg-destructive-soft",
        pending && "pointer-events-none",
        className,
      )}
    >
      <span>{currentLabel}</span>
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center bg-destructive px-5 text-destructive-foreground"
        style={{
          clipPath: filled ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
          transition: `clip-path ${holding ? holdMs : DRAIN_MS}ms linear`,
        }}
      >
        {currentLabel}
        {filled && (
          <span className="animate-shimmer absolute inset-0 bg-[linear-gradient(100deg,transparent_30%,rgb(255_255_255/0.28)_50%,transparent_70%)] bg-[length:200%_100%]" />
        )}
      </span>
      <span className="sr-only">Press and hold to confirm.</span>
    </button>
  );
}
