export const HERO_INPUT_CLASS =
  "tabular border-hero-fg/20 bg-hero-fg/10 text-hero-fg placeholder:text-hero-fg/45 dark:bg-hero-fg/10";

export function StatusLookupShell({
  description,
  footnote,
  children,
}: {
  description: string;
  footnote?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="text-micro uppercase text-gold-soft-foreground">
          Status Peminjaman
        </div>
        <h1 className="mt-3 font-heading text-h1 text-foreground">
          Cek status kamu
        </h1>
        <p className="mt-2 text-body-lg text-foreground-2">{description}</p>
      </div>
      <div className="w-full max-w-sm">{children}</div>
      {footnote && (
        <p className="max-w-sm text-center text-caption text-foreground-2">
          {footnote}
        </p>
      )}
    </main>
  );
}
