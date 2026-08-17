"use client";

import { ErrorPanel } from "@/components/ErrorPanel";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPanel
      error={error}
      reset={reset}
      title="Something went wrong"
      description="This page failed to load. The error has been reported automatically — please try again in a moment."
      resetLabel="Try Again"
      homeHref="/admin/dashboard"
      homeLabel="Back to Dashboard"
    />
  );
}
