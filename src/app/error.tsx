"use client";

import { ErrorPanel } from "@/components/ErrorPanel";

export default function RootError({
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
      title="Terjadi Kendala di Server"
      description="Insiden ini sudah dilaporkan otomatis ke admin. Silakan coba beberapa menit lagi."
      resetLabel="Coba Lagi"
      homeHref="/"
      homeLabel="Ke Beranda"
    />
  );
}
