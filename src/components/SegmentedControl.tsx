"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTION_CLASS =
  "relative z-10 inline-flex items-center justify-center gap-1.5 rounded px-3 py-1.5 text-center text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const ACTIVE_OPTION_CLASS = "font-semibold text-foreground";

function isPlainClick(event: React.MouseEvent) {
  return !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  ariaLabel,
}: {
  options: readonly {
    id: T;
    label: string;
    href?: string;
    icon?: LucideIcon;
  }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  ariaLabel?: string;
}) {
  const activeIndex = options.findIndex((option) => option.id === value);

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "rounded-lg border border-border bg-surface-2 p-[3px]",
        className,
      )}
    >
      <div className="relative grid auto-cols-fr grid-flow-col">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 rounded bg-surface shadow-sm transition-[translate] duration-200 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none"
          style={{
            width: `${100 / options.length}%`,
            translate: `${Math.max(activeIndex, 0) * 100}% 0`,
          }}
        />
        {options.map((option) => {
          const active = option.id === value;
          const optionClass = cn(OPTION_CLASS, active && ACTIVE_OPTION_CLASS);
          const content = (
            <>
              {option.icon && (
                <option.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              )}
              {option.label}
            </>
          );
          return option.href ? (
            <Link
              key={option.id}
              href={option.href}
              aria-current={active ? "true" : undefined}
              className={optionClass}
              onClick={(event) => {
                if (!isPlainClick(event)) return;
                event.preventDefault();
                onChange(option.id);
              }}
            >
              {content}
            </Link>
          ) : (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              className={optionClass}
              onClick={() => onChange(option.id)}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
