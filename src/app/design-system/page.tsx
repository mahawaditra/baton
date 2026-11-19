import type { Metadata } from "next";
import { BackHomeLink } from "@/components/BackHomeLink";
import { MusicGlyph } from "@/components/MusicGlyph";
import { PublicFooter } from "@/components/PublicFooter";
import { TicketLabel } from "@/components/TicketCard";
import { ComponentSections } from "./ComponentSections";
import {
  ActiveSectionProvider,
  DesignSystemChips,
  DesignSystemNav,
} from "./DesignSystemNav";
import { FoundationsSections } from "./FoundationsSections";
import { GuidelineSections } from "./GuidelineSections";
import { readDesignTokens } from "./tokens";
import { staggerStyle } from "@/lib/utils";

export const dynamic = "force-static";

const DESCRIPTION =
  "The colours, glyphs and components that make BATON read like a score, rendered straight from the code.";

export const metadata: Metadata = {
  title: "Design system · BATON",
  description: DESCRIPTION,
  openGraph: {
    title: "BATON design system",
    description: DESCRIPTION,
    siteName: "BATON",
    type: "website",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
};

export default function DesignSystemPage() {
  const tokens = readDesignTokens();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-hero-bg px-6 pt-6 pb-14 text-hero-fg">
        <div className="mx-auto w-full max-w-6xl">
          <BackHomeLink />
          <div className="mt-10 flex max-w-2xl flex-col gap-3">
            <div data-stagger style={staggerStyle(0)}>
              <TicketLabel>Behind the score</TicketLabel>
            </div>
            <h1
              data-stagger
              style={staggerStyle(1)}
              className="flex items-center gap-3 font-heading text-display"
            >
              <MusicGlyph
                glyph="reverseFinalBarline"
                className="text-[2.75rem] text-gold"
              />
              Design system
            </h1>
            <p
              data-stagger
              style={staggerStyle(2)}
              className="text-body-lg text-hero-fg/80"
            >
              BATON&apos;s visual language is quite literally definitely loosely
              defined by haseulbintaro&apos;s personal identity: matte gold,
              warm cream, soft plum and midnight ink, which definitely
              doesn&apos;t have any other meaning whatsoever,{" "}
              <b>or at least that&apos;s what they want you to believe</b>.
              Everything on this page is rendered from the real tokens and
              components in the codebase, so it can&apos;t drift from the app.
            </p>
            <a
              href="https://github.com/mahawaditra/baton"
              target="_blank"
              rel="noopener noreferrer"
              data-stagger
              style={staggerStyle(3)}
              className="w-fit text-caption text-hero-fg/70 underline-offset-4 hover:text-hero-fg hover:underline"
            >
              mahawaditra/baton on GitHub
            </a>
          </div>
        </div>
      </header>

      <ActiveSectionProvider>
        <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-12">
          <DesignSystemNav />
          <div className="flex min-w-0 flex-col gap-12">
            <DesignSystemChips />
            <FoundationsSections tokens={tokens} />
            <ComponentSections />
            <GuidelineSections />
          </div>
        </main>
      </ActiveSectionProvider>

      <PublicFooter />
    </div>
  );
}
