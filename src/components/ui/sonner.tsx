"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CheckCircle2,
  TriangleAlert,
  OctagonX,
  Info,
  Loader2,
} from "lucide-react";

function subscribeToViewport(callback: () => void) {
  const query = window.matchMedia("(max-width: 640px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getIsMobileSnapshot() {
  return window.matchMedia("(max-width: 640px)").matches;
}

function getIsMobileServerSnapshot() {
  return false;
}

function useIsMobile() {
  return useSyncExternalStore(
    subscribeToViewport,
    getIsMobileSnapshot,
    getIsMobileServerSnapshot,
  );
}

const Toaster = ({ ...props }: ToasterProps) => {
  const isMobile = useIsMobile();
  const { resolvedTheme } = useTheme();
  const toasterTheme: ToasterProps["theme"] =
    resolvedTheme === "dark" ? "dark" : "light";

  return (
    <Sonner
      theme={toasterTheme}
      position={isMobile ? "top-center" : "bottom-right"}
      duration={5000}
      closeButton
      icons={{
        success: <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />,
        info: <Info className="h-4 w-4" strokeWidth={2.2} />,
        warning: <TriangleAlert className="h-4 w-4" strokeWidth={2.2} />,
        error: <OctagonX className="h-4 w-4" strokeWidth={2.2} />,
        loading: <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.2} />,
      }}
      toastOptions={{
        unstyled: true,
      }}
      {...props}
    />
  );
};

export { Toaster };
