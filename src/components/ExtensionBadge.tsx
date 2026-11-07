import { MusicGlyph } from "@/components/MusicGlyph";

export function ExtensionBadge({ count }: { count: number }) {
  if (count < 1) return null;
  return (
    <span
      title={`Extension ${count}`}
      className="inline-flex h-[22px] items-center gap-1 rounded-sm bg-plum-soft px-1.5 text-micro font-semibold text-plum"
    >
      <MusicGlyph glyph="rightRepeat" className="text-[0.875rem]" />
      <span className="sr-only">Extension</span>
      {count}
    </span>
  );
}
