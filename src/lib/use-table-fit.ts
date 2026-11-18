"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

export function useTableFit() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [requiredWidth, setRequiredWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || requiredWidth === null) return;
    const observer = new ResizeObserver(() => {
      if (root.clientWidth >= requiredWidth) setRequiredWidth(null);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [requiredWidth]);

  const onOverflow = useCallback((overflow: number) => {
    const root = rootRef.current;
    if (root) setRequiredWidth(root.clientWidth + overflow);
  }, []);

  return { rootRef, tableFits: requiredWidth === null, onOverflow };
}
