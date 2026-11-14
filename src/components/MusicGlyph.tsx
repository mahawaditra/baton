import { Noto_Music } from "next/font/google";
import { cn } from "@/lib/utils";

const notoMusic = Noto_Music({
  weight: "400",
  subsets: ["music"],
  display: "swap",
});

const MUSIC_GLYPHS = {
  reverseFinalBarline: { char: "\u{1D103}", className: "" },
  finalBarline: { char: "\u{1D102}", className: "" },
  leftRepeat: { char: "\u{1D106}", className: "" },
  rightRepeat: { char: "\u{1D107}", className: "" },
  fermata: { char: "\u{1D110}", className: "inline-block h-[0.36em]" },
  quarterRest: { char: "\u{1D13D}", className: "" },
  dynamicP: { char: "\u{1D18F}", className: "" },
  dynamicMP: { char: "\u{1D190}\u{1D18F}", className: "" },
  dynamicMF: { char: "\u{1D190}\u{1D191}", className: "" },
  dynamicF: { char: "\u{1D191}", className: "" },
  dynamicSFZ: { char: "\u{1D18D}\u{1D191}\u{1D18E}", className: "" },
} as const;

export type MusicGlyphName = keyof typeof MUSIC_GLYPHS;

export function MusicGlyph({
  glyph,
  className,
}: {
  glyph: MusicGlyphName;
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
