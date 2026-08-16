"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

type DynamicWeightTextProps = {
  text: string;
  className?: string;
  fromWeight?: number;
  toWeight?: number;
  radius?: number;
};

const NBSP = " ";

export function DynamicWeightText({
  text,
  className,
  fromWeight = 400,
  toWeight = 800,
  radius = 160,
}: DynamicWeightTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const currentWeightsRef = useRef<number[]>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const letters = Array.from(
      container.querySelectorAll<HTMLSpanElement>("[data-letter]"),
    );
    currentWeightsRef.current = letters.map(() => fromWeight);

    if (prefersReducedMotion) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      pointerRef.current = { x: event.clientX, y: event.clientY };
    }
    function handlePointerLeave() {
      pointerRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("mouseleave", handlePointerLeave);

    let frame: number;
    function tick() {
      const pointer = pointerRef.current;
      letters.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        let target = fromWeight;
        if (pointer) {
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const distance = Math.hypot(pointer.x - cx, pointer.y - cy);
          const proximity = Math.max(0, 1 - distance / radius);
          const eased = proximity * proximity * (3 - 2 * proximity);
          target = fromWeight + (toWeight - fromWeight) * eased;
        }
        const current = currentWeightsRef.current[index];
        const next = current + (target - current) * 0.18;
        currentWeightsRef.current[index] = next;
        el.style.fontWeight = String(Math.round(next));
      });
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
      cancelAnimationFrame(frame);
    };
  }, [text, fromWeight, toWeight, radius, prefersReducedMotion]);

  return (
    <span ref={containerRef} className={cn("inline-flex", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split("").map((char, index) => (
          <span
            key={index}
            data-letter
            className="inline-block"
            style={{ fontWeight: fromWeight }}
          >
            {char === " " ? NBSP : char}
          </span>
        ))}
      </span>
    </span>
  );
}
