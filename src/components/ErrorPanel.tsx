"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorPanel({
  error,
  reset,
  title,
  description,
  resetLabel,
  homeHref,
  homeLabel,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title: string;
  description: string;
  resetLabel: string;
  homeHref: string;
  homeLabel: string;
}) {
  const [eventId] = useState(() => Sentry.captureException(error));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <EmptyState
        icon={TriangleAlert}
        title={title}
        description={description}
        tone="error"
        action={
          <div className="flex items-center gap-3">
            <Button onClick={() => reset()}>{resetLabel}</Button>
            <Link
              href={homeHref}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              {homeLabel}
            </Link>
          </div>
        }
      />
      {eventId && (
        <p className="tabular mt-2 text-micro text-muted-foreground">
          ref: {eventId}
        </p>
      )}
    </div>
  );
}
