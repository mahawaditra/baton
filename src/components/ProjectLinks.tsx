import Image from "next/image";
import { cn } from "@/lib/utils";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2C6 20.94 5.34 19 5.34 19c-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.53.11-3.19 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.19.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.21.69.8.57 4.57-1.52 7.85-5.83 7.85-10.91C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

const TONE_CLASS = {
  page: "border-border text-foreground hover:bg-muted",
  hero: "border-hero-fg/30 text-hero-fg hover:bg-hero-fg/8",
};

export function ProjectLinks({
  tone = "page",
  className,
}: {
  tone?: keyof typeof TONE_CLASS;
  className?: string;
}) {
  const linkClass = cn(
    "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-caption font-medium transition-colors",
    TONE_CLASS[tone],
  );

  return (
    <div
      className={cn(
        "flex flex-col items-start gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3",
        className,
      )}
    >
      <a
        href="https://github.com/mahawaditra/baton"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        <GithubIcon className="h-3.5 w-3.5" />
        mahawaditra/baton
      </a>
      <a
        href="https://vanillaine.my.id"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        <Image
          src="/about/loonaColors.svg"
          alt=""
          width={14}
          height={14}
          className="shrink-0"
        />
        vanillaine.my.id
      </a>
    </div>
  );
}
