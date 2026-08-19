"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollapsibleGroup<T>({
  label,
  items,
  isCollapsed,
  onToggle,
  renderItem,
}: {
  label: string;
  items: T[];
  isCollapsed: boolean;
  onToggle: () => void;
  renderItem: (item: T) => React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | undefined>(
    undefined,
  );
  const contentId = useId();

  useLayoutEffect(() => {
    if (contentRef.current) {
      setMeasuredHeight(contentRef.current.scrollHeight);
    }
  }, [items]);

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!isCollapsed}
        aria-controls={contentId}
        className="sticky top-[66px] z-10 -mx-1 flex w-[calc(100%+8px)] items-center gap-2 bg-background/95 px-1 py-2 backdrop-blur-sm"
      >
        <span className="text-micro uppercase text-muted-foreground">
          {label}
        </span>
        <span className="tabular flex h-[18px] min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-micro text-muted-foreground">
          {items.length}
        </span>
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 text-muted-foreground transition-transform",
            isCollapsed && "-rotate-90",
          )}
          strokeWidth={1.75}
        />
      </button>
      <div
        id={contentId}
        style={{
          height: isCollapsed ? 0 : (measuredHeight ?? "auto"),
          overflow: "hidden",
          transition:
            "height .32s cubic-bezier(.2,.8,.2,1), margin-bottom .32s cubic-bezier(.2,.8,.2,1), opacity .22s ease",
          marginBottom: isCollapsed ? 4 : 20,
          opacity: isCollapsed ? 0.6 : 1,
        }}
      >
        <div ref={contentRef} className="flex flex-col gap-2.5 pt-1">
          {items.map((item) => renderItem(item))}
        </div>
      </div>
    </div>
  );
}
