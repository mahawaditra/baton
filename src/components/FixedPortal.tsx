"use client";

import { createPortal } from "react-dom";
import { useMounted } from "@/lib/use-mounted";

export function FixedPortal({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(children, document.body);
}
