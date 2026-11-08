import { MusicGlyph } from "@/components/MusicGlyph";
import { cn } from "@/lib/utils";

const BARLINE_CLASS = "shrink-0 text-[1.75rem] text-gold";

export function BarlineHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "flex items-center justify-center gap-3 font-heading text-h2 text-foreground",
        className,
      )}
    >
      <MusicGlyph glyph="reverseFinalBarline" className={BARLINE_CLASS} />
      <span>{children}</span>
      <MusicGlyph glyph="finalBarline" className={BARLINE_CLASS} />
    </h2>
  );
}
