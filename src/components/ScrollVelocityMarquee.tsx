"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

function useElementWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    function updateWidth() {
      if (ref.current) setWidth(ref.current.offsetWidth);
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [ref]);

  return width;
}

function wrap(min: number, max: number, value: number) {
  const range = max - min;
  const mod = (((value - min) % range) + range) % range;
  return mod + min;
}

function VelocityRow({
  text,
  baseVelocity,
  numCopies,
  className,
}: {
  text: string;
  baseVelocity: number;
  numCopies: number;
  className?: string;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const copyRef = useRef<HTMLSpanElement>(null);
  const copyWidth = useElementWidth(copyRef);

  const x = useTransform(baseX, (v) => {
    if (copyWidth === 0) return "0px";
    return `${wrap(-copyWidth, 0, v)}px`;
  });

  const directionFactor = useRef(1);
  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden">
      <motion.div
        className={cn("flex whitespace-nowrap", className)}
        style={{ x }}
      >
        {Array.from({ length: numCopies }).map((_, index) => (
          <span
            key={index}
            ref={index === 0 ? copyRef : null}
            className="shrink-0 pr-8"
          >
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function ScrollVelocityMarquee({
  text,
  rows = 7,
  velocity = 40,
  numCopies = 6,
  className,
}: {
  text: string;
  rows?: number;
  velocity?: number;
  numCopies?: number;
  className?: string;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div className="flex h-full flex-col justify-between py-6">
      {Array.from({ length: rows }).map((_, index) => (
        <VelocityRow
          key={index}
          text={text}
          baseVelocity={index % 2 === 0 ? velocity : -velocity}
          numCopies={numCopies}
          className={className}
        />
      ))}
    </div>
  );
}
