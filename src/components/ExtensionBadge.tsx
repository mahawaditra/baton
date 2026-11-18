import { GlyphBadge, type GlyphBadgeVariant } from "@/components/GlyphBadge";

export function ExtensionBadge({
  count,
  variant,
}: {
  count: number;
  variant?: GlyphBadgeVariant;
}) {
  if (count < 1) return null;
  return (
    <GlyphBadge
      glyph="rightRepeat"
      variant={variant}
      title={`Extension ${count}`}
    >
      <span className="sr-only">Extension</span>
      {count}
    </GlyphBadge>
  );
}
