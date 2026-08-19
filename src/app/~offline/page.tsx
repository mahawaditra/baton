"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <svg
        viewBox="0 0 240 140"
        className="h-28 w-auto text-gold"
        stroke="currentColor"
        strokeWidth={7}
        fill="none"
        strokeLinecap="round"
      >
        <line x1="30" y1="105" x2="105" y2="55" opacity={0.95} />
        <circle cx="30" cy="105" r="9" fill="currentColor" stroke="none" />
        <line x1="135" y1="35" x2="210" y2="18" opacity={0.95} />
        <g strokeWidth={2.5} opacity={0.65}>
          <path d="M105 55 l 5 -5" />
          <path d="M105 55 l -2 -6" />
          <path d="M105 55 l 8 -1" />
          <path d="M135 35 l -6 3" />
          <path d="M135 35 l -3 -6" />
          <path d="M135 35 l -8 -1" />
        </g>
      </svg>

      <div>
        <h1 className="text-h2">I think you&apos;re offline, big dawg.</h1>
        <p className="mt-3 max-w-xs text-body text-muted-foreground">
          You got disconnected. Check your wifi or mobile data, and try again.
        </p>
      </div>

      <Button onClick={() => location.reload()}>
        <RotateCw className="h-4 w-4" strokeWidth={1.75} />
        Try Again
      </Button>

      <p className="text-caption text-muted-foreground">
        Some data might still be available on the main page.
      </p>
    </div>
  );
}
