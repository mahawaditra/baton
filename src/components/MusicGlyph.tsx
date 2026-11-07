import { Noto_Music } from "next/font/google";
import { cn } from "@/lib/utils";

const notoMusic = Noto_Music({
  weight: "400",
  subsets: ["music"],
  display: "swap",
});

const MUSIC_GLYPHS = {
  reverseFinalBarline: { char: "\u{1D103}", className: "" },
  rightRepeat: { char: "\u{1D107}", className: "" },
  fermata: { char: "\u{1D110}", className: "inline-block h-[0.36em]" },
  quarterRest: { char: "\u{1D13D}", className: "" },
} as const;

export function MusicGlyph({
  glyph,
  className,
}: {
  glyph: keyof typeof MUSIC_GLYPHS;
  className?: string;
}) {
  const { char, className: glyphClassName } = MUSIC_GLYPHS[glyph];
  return (
    <span
      aria-hidden
      className={cn(
        notoMusic.className,
        glyphClassName,
        className,
        "leading-none",
      )}
    >
      {char}
    </span>
  );
}
