const LOADING_MARQUEE_ITEMS =
  "VIOLIN × VIOLA × CELLO × CONTRABASS × FRENCH HORN × TRUMPET × TROMBONE × TUBA × OBOE × CLARINET × BASSOON × FLUTE × PERCUSSION ×";

const LOADING_MARQUEE_TEXT = `${LOADING_MARQUEE_ITEMS} ${LOADING_MARQUEE_ITEMS}`;

export function LoadingMarquee() {
  return (
    <div aria-hidden className="w-full max-w-full min-w-0 overflow-hidden">
      <div
        className="marquee-track marquee-l font-heading text-lg font-bold tracking-wide text-gold motion-reduce:animate-none"
        style={{ animationDuration: "16s" }}
      >
        <span>{LOADING_MARQUEE_TEXT}</span>
        <span>{LOADING_MARQUEE_TEXT}</span>
      </div>
    </div>
  );
}
