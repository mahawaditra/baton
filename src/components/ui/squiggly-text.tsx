"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SquigglyTextProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  steps?: number;
  stepDuration?: number;
  scale?: number | [number, number];
  baseFrequency?: number;
  numOctaves?: number;
}

export function SquigglyText({
  children,
  steps = 5,
  stepDuration = 80,
  scale = [6, 8],
  baseFrequency = 0.02,
  numOctaves = 3,
  className,
  style,
}: SquigglyTextProps) {
  const safeId = useId().replace(/[:_]/g, "");
  const filterIds = useMemo(
    () => Array.from({ length: steps }, (_, i) => `squiggly-${safeId}-${i}`),
    [steps, safeId],
  );
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.style.filter = "none";
      return;
    }

    let step = 0;
    const timer = window.setInterval(() => {
      step = (step + 1) % filterIds.length;
      element.style.filter = `url(#${filterIds[step]})`;
    }, stepDuration);
    return () => window.clearInterval(timer);
  }, [filterIds, stepDuration]);

  const scaleAt = (index: number) =>
    Array.isArray(scale) ? scale[index % scale.length] : scale;

  return (
    <span
      ref={ref}
      style={{ filter: `url(#${filterIds[0]})`, ...style }}
      className={cn("inline-block", className)}
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {filterIds.map((id, index) => (
            <filter id={id} key={id}>
              <feTurbulence
                baseFrequency={baseFrequency}
                numOctaves={numOctaves}
                result="noise"
                seed={index}
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={scaleAt(index)}
              />
            </filter>
          ))}
        </defs>
      </svg>
      {children}
    </span>
  );
}
