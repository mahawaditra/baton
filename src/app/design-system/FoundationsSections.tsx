import {
  isDynamicGlyph,
  MUSIC_GLYPH_NAMES,
  MusicGlyph,
  type DynamicGlyphName,
  type MusicGlyphName,
} from "@/components/MusicGlyph";
import { cn } from "@/lib/utils";
import { SchemePreview } from "./demos";
import { GroupHeading, Specimen, Subsection } from "./parts";
import { paletteReference, type DesignTokens } from "./tokens";

const ROLE_GROUPS = [
  {
    title: "Surfaces",
    tokens: [
      "background",
      "surface",
      "surface-2",
      "muted",
      "border",
      "border-strong",
    ],
  },
  {
    title: "Text",
    tokens: ["foreground", "foreground-2", "muted-foreground"],
  },
  {
    title: "Brand",
    tokens: ["primary", "hero-bg", "plum", "plum-soft", "gold", "gold-soft"],
  },
  {
    title: "Status",
    tokens: [
      "success",
      "success-soft",
      "warning",
      "warning-soft",
      "destructive",
      "destructive-soft",
      "info",
      "info-soft",
    ],
  },
];

const RADII = ["xs", "sm", "", "md", "lg", "xl"];
const SHADOWS = ["sm", "md", "lg", "popover"];

const MOTION = [
  {
    name: "Open and close",
    value: "250ms · cubic-bezier(0.2, 0, 0, 1)",
    use: "Disclosure, Collapse, theme toggle icon",
  },
  {
    name: "Segment slide",
    value: "200ms · cubic-bezier(0.2, 0, 0, 1)",
    use: "Segmented control indicator",
  },
  {
    name: "Page enter",
    value: "260ms · fade + 8px rise",
    use: "Admin pages; fade only below lg",
  },
  {
    name: "Stagger",
    value: "40ms per item",
    use: "Dashboard cards, Handbook blocks",
  },
  {
    name: "Reveal",
    value: "600ms · fade + 24px rise",
    use: "Landing sections as they scroll in",
  },
];

const GLYPH_DOCS: Record<
  Exclude<MusicGlyphName, DynamicGlyphName>,
  { name: string; music: string; baton: string; colour: string }
> = {
  reverseFinalBarline: {
    name: "Reverse final barline",
    music: "Opens a score",
    baton: "Brand mark, opens every landing heading",
    colour: "Gold",
  },
  finalBarline: {
    name: "Final barline",
    music: "Closes a score",
    baton: "Closes landing headings, end of a returned loan",
    colour: "Gold",
  },
  leftRepeat: {
    name: "Left repeat",
    music: "Start of a repeated passage",
    baton: "Loan active, the step an extension loops back to",
    colour: "Gold",
  },
  rightRepeat: {
    name: "Right repeat",
    music: "Go back and play again",
    baton: "Extension badge",
    colour: "Text colour",
  },
  fermata: {
    name: "Fermata",
    music: "Hold longer",
    baton: "Ongoing loans carried into a new term",
    colour: "Plum on neutral surfaces, text colour inside badges",
  },
  quarterRest: {
    name: "Quarter rest",
    music: "Silence",
    baton: "Every empty state",
    colour: "Tone of the empty state",
  },
};

const DYNAMIC_LABELS: Record<DynamicGlyphName, string> = {
  dynamicP: "1 · very unhappy",
  dynamicMP: "2",
  dynamicMF: "3",
  dynamicF: "4",
  dynamicSFZ: "5 · very happy",
};

const STRUCTURAL_GLYPHS = MUSIC_GLYPH_NAMES.filter(
  (glyph): glyph is Exclude<MusicGlyphName, DynamicGlyphName> =>
    !isDynamicGlyph(glyph),
);
const DYNAMIC_GLYPHS = MUSIC_GLYPH_NAMES.filter(isDynamicGlyph);

function RoleSwatch({
  name,
  light,
  dark,
}: {
  name: string;
  light: string;
  dark: string;
}) {
  return (
    <li className="flex min-w-0 items-center gap-3">
      <span
        className="h-10 w-10 shrink-0 rounded-md border border-border"
        style={{ background: `var(--${name})` }}
      />
      <span className="flex min-w-0 flex-col">
        <code className="truncate text-label text-foreground">--{name}</code>
        <span className="truncate text-caption text-muted-foreground">
          {light}
          {dark !== light && ` · dark ${dark}`}
        </span>
      </span>
    </li>
  );
}

export function FoundationsSections({ tokens }: { tokens: DesignTokens }) {
  return (
    <>
      <GroupHeading id="foundations">Foundations</GroupHeading>

      <Subsection
        id="colour"
        title="Colour"
        description="Two layers. The palette holds raw OKLCH values on a 50–950 scale and is never used by components directly. Role tokens point into the palette, so a new palette only changes the role mapping, not the components."
      >
        <Specimen
          label="Palette, read from globals.css at build time"
          className="flex-col"
        >
          {tokens.palette.map((family) => (
            <div key={family.name} className="flex w-full flex-col gap-1.5">
              <span className="text-micro text-muted-foreground uppercase">
                {family.name}
              </span>
              <ol className="grid grid-cols-6 gap-1 sm:grid-cols-11">
                {family.steps.map(({ step, value }) => (
                  <li key={step} className="flex min-w-0 flex-col gap-1">
                    <span
                      title={value}
                      className="h-9 rounded-sm border border-border"
                      style={{ background: `var(--${family.name}-${step})` }}
                    />
                    <span className="tabular text-micro text-muted-foreground">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </Specimen>
        <SchemePreview>
          <div
            data-reveal-grid
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            {ROLE_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <span className="text-micro text-muted-foreground uppercase">
                  {group.title}
                </span>
                <ul className="flex flex-col gap-2.5">
                  {group.tokens.map((name) => {
                    const light = paletteReference(tokens.light.get(name));
                    const dark =
                      paletteReference(tokens.dark.get(name)) || light;
                    return (
                      <RoleSwatch
                        key={name}
                        name={name}
                        light={light}
                        dark={dark}
                      />
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </SchemePreview>
      </Subsection>

      <Subsection
        id="typography"
        title="Typography"
        description="Plus Jakarta Sans for everything, with tabular numbers for ticket IDs, dates and money. Headings balance their lines; paragraphs avoid orphans. Sentence case everywhere except proper names."
      >
        <Specimen className="flex-col gap-4">
          {tokens.textSizes.map((size) => (
            <div
              key={size.name}
              className="grid w-full grid-cols-1 items-baseline gap-1 sm:grid-cols-[11rem_1fr]"
            >
              <span className="tabular text-caption text-muted-foreground">
                text-{size.name} · {size.size}
              </span>
              <span
                className={cn(
                  "text-foreground",
                  size.name === "micro" && "uppercase",
                )}
                style={{
                  fontSize: `var(--text-${size.name})`,
                  lineHeight: `var(--text-${size.name}--line-height)`,
                  fontWeight: `var(--text-${size.name}--font-weight)`,
                  letterSpacing: `var(--text-${size.name}--letter-spacing)`,
                }}
              >
                Ticket 26999901 is ready to pick up
              </span>
            </div>
          ))}
        </Specimen>
      </Subsection>

      <Subsection
        id="shape"
        title="Radius & shadow"
        description="Small radii and thin borders keep things quiet. Nested corners subtract the padding: a 12px box with 3px padding holds a 9px inner corner. Shadows are tinted with the primary ink, never pure black."
      >
        <div data-reveal-grid className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Specimen label="Radius tokens" className="items-end">
            {RADII.map((name) => (
              <div
                key={name || "default"}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className="h-12 w-12 border-2 border-primary bg-primary/10"
                  style={{
                    borderRadius: `var(--radius${name ? `-${name}` : ""})`,
                  }}
                />
                <span className="text-micro text-muted-foreground">
                  {name || "base"}
                </span>
              </div>
            ))}
          </Specimen>
          <Specimen label="Shadow tokens" className="items-end gap-5">
            {SHADOWS.map((name) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <span
                  className="h-12 w-12 rounded-md bg-surface"
                  style={{ boxShadow: `var(--shadow-${name})` }}
                />
                <span className="text-micro text-muted-foreground">{name}</span>
              </div>
            ))}
          </Specimen>
        </div>
      </Subsection>

      <Subsection
        id="motion"
        title="Motion"
        description="Motion explains a change, it doesn't decorate it. Everything sits inside prefers-reduced-motion: no-preference; with reduced motion, changes are instant."
      >
        <Specimen className="p-0 sm:p-0">
          <table className="w-full text-left text-body">
            <thead>
              <tr className="border-b border-border text-micro text-muted-foreground uppercase">
                <th className="px-4 py-2.5 font-semibold">Pattern</th>
                <th className="px-4 py-2.5 font-semibold">Timing</th>
                <th className="hidden px-4 py-2.5 font-semibold sm:table-cell">
                  Used in
                </th>
              </tr>
            </thead>
            <tbody>
              {MOTION.map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-2.5 text-foreground">{row.name}</td>
                  <td className="tabular px-4 py-2.5 text-foreground-2">
                    {row.value}
                  </td>
                  <td className="hidden px-4 py-2.5 text-foreground-2 sm:table-cell">
                    {row.use}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Specimen>
      </Subsection>

      <Subsection
        id="glyphs"
        title="Music glyphs"
        description="Noto Music glyphs stand in for icons only where the musical meaning fits. They are always aria-hidden and always sit next to a text label. Inline glyphs scale with the text around them; display glyphs keep explicit sizes."
      >
        <Specimen className="p-0 sm:p-0">
          <ul className="w-full">
            {STRUCTURAL_GLYPHS.map((glyph) => {
              const row = GLYPH_DOCS[glyph];
              return (
                <li
                  key={glyph}
                  className="grid grid-cols-[3rem_1fr] gap-x-4 gap-y-1 border-b border-border px-4 py-3 last:border-b-0 sm:grid-cols-[3rem_12rem_1fr]"
                >
                  <MusicGlyph
                    glyph={glyph}
                    className="row-span-2 text-[2rem] text-gold sm:row-span-1"
                  />
                  <span className="text-label text-foreground">{row.name}</span>
                  <span className="text-body text-foreground-2 sm:col-start-3">
                    <span className="text-muted-foreground">{row.music}.</span>{" "}
                    {row.baton}. {row.colour}.
                  </span>
                </li>
              );
            })}
          </ul>
        </Specimen>
        <Specimen label="Dynamics as the survey rating scale, from p to sfz">
          {DYNAMIC_GLYPHS.map((glyph) => (
            <div key={glyph} className="flex flex-col items-center gap-1">
              <span className="flex h-12 w-16 items-center justify-center rounded border border-border bg-background">
                <MusicGlyph glyph={glyph} className="text-[2.5rem]" />
              </span>
              <span className="text-micro text-muted-foreground">
                {DYNAMIC_LABELS[glyph]}
              </span>
            </div>
          ))}
        </Specimen>
      </Subsection>
    </>
  );
}
