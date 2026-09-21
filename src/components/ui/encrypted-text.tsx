"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type EncryptedTextProps = {
  text: string;
  className?: string;
  revealDelayMs?: number;
  flipDelayMs?: number;
  charset?: string;
  encryptedClassName?: string;
  revealedClassName?: string;
};

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?";

function randomCharacter(charset: string) {
  return charset.charAt(Math.floor(Math.random() * charset.length));
}

export function EncryptedText({
  text,
  className,
  revealDelayMs = 50,
  flipDelayMs = 50,
  charset = DEFAULT_CHARSET,
  encryptedClassName,
  revealedClassName,
}: EncryptedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const [revealCount, setRevealCount] = useState(text.length);
  const [scrambled, setScrambled] = useState<string[]>([]);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setInView(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let frame = 0;
    let lastFlip = Number.NEGATIVE_INFINITY;
    const startedAt = performance.now();

    const update = (now: number) => {
      if (cancelled) return;

      const count = Math.min(
        text.length,
        Math.floor((now - startedAt) / Math.max(1, revealDelayMs)),
      );
      setRevealCount(count);
      if (count >= text.length) return;

      if (now - lastFlip >= Math.max(0, flipDelayMs)) {
        lastFlip = now;
        setScrambled(
          Array.from(text, (char) =>
            char === " " ? " " : randomCharacter(charset),
          ),
        );
      }
      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [inView, text, revealDelayMs, flipDelayMs, charset]);

  return (
    <span ref={ref} className={cn(className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {Array.from(text).map((char, index) => {
          const revealed = index < revealCount || char === " ";
          const shown = revealed ? char : (scrambled[index] ?? char);
          return (
            <span
              key={index}
              className={cn(revealed ? revealedClassName : encryptedClassName)}
            >
              {shown}
            </span>
          );
        })}
      </span>
    </span>
  );
}
