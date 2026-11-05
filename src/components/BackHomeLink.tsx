import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackHomeLink() {
  return (
    <Link
      href="/"
      aria-label="Kembali ke beranda BATON"
      className="inline-flex h-11 items-center gap-2 text-hero-fg/75 transition-colors hover:text-hero-fg"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
      <span className="font-heading text-label font-bold tracking-[0.04em]">
        BATON
      </span>
    </Link>
  );
}
