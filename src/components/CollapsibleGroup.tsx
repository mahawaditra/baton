"use client";

import { useId, useState } from "react";
import { Collapse, CollapseChevron } from "@/components/Collapse";

export function CollapsibleGroup<T>({
  label,
  items,
  renderItem,
}: {
  label: React.ReactNode;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  const contentId = useId();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setIsCollapsed((collapsed) => !collapsed)}
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
        <CollapseChevron
          open={!isCollapsed}
          className="ml-auto text-muted-foreground"
        />
      </button>
      <Collapse id={contentId} open={!isCollapsed}>
        <div className="flex flex-col gap-2.5 pt-1 pb-4">
          {items.map((item) => renderItem(item))}
        </div>
      </Collapse>
    </div>
  );
}
