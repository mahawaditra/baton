import { MusicGlyph, type MusicGlyphName } from "@/components/MusicGlyph";
import { cn } from "@/lib/utils";

const GLYPH_BADGE_VARIANT = {
  soft: "bg-plum-soft text-plum",
  outline: "border border-hero-fg/25 text-hero-fg/80",
} as const;

export type GlyphBadgeVariant = keyof typeof GLYPH_BADGE_VARIANT;

export function GlyphBadge({
  glyph,
  variant = "soft",
  title,
  className,
  children,
}: {
  glyph: MusicGlyphName;
  variant?: GlyphBadgeVariant;
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={title}
      className={cn(
        "tabular inline-flex h-[22px] items-center gap-1 rounded-sm px-1.5 text-micro uppercase",
        GLYPH_BADGE_VARIANT[variant],
        className,
      )}
    >
      <MusicGlyph glyph={glyph} inline />
      {children}
    </span>
  );
}
