"use client";

import { createPortal } from "react-dom";
import { useMounted } from "@/lib/use-mounted";

export function AdminHeaderAction({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  if (!mounted) return null;
  const target = document.getElementById("admin-header-action");
  if (!target) return null;
  return createPortal(children, target);
}
