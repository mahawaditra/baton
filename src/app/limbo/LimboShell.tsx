import { AuroraBackground } from "@/components/ui/aurora-background";

export function LimboShell({ children }: { children: React.ReactNode }) {
  return (
    <AuroraBackground>
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl rounded-3xl bg-linear-to-b from-gold/80 via-gold/25 to-gold/60 p-[1.5px] shadow-sm">
          <div className="legacy-plaque relative flex flex-col items-center gap-6 rounded-[calc(1.5rem-1.5px)] px-6 py-10 text-center sm:px-10">
            <div
              aria-hidden
              className="legacy-emblem aspect-[229/287] h-16"
            />
            <h1 className="font-heading text-h1 text-foreground">
              The sacrifice is made.
            </h1>
            <p className="text-body-lg text-foreground-2">
              Your comrades have been offered up. Every eclipse they spent
              alongside you, working hard for Mahawaditra, is remembered —
              thank you for your patronage. I hope you never regret this. One
              offering remains, and it is yours. Leave a piece of your soul,
              and your name will outlive your access. There is no undoing this.
            </p>
            {children}
          </div>
        </div>
      </main>
    </AuroraBackground>
  );
}
