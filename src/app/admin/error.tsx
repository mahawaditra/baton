"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong.</h2>
      <p>This page failed to load. The error has been reported.</p>
      <button onClick={() => reset()}>Try again</button>
      <p>
        <Link href="/admin/dashboard">Back to Dashboard</Link>
      </p>
    </div>
  );
}
