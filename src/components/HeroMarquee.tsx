const MARQUEE_TEXT =
  "VIOLIN × VIOLA × CELLO × CONTRABASS × FRENCH HORN × TRUMPET × TROMBONE × TUBA × OBOE × CLARINET × BASSOON × FLUTE × PERCUSSION ×";
const COPIES_PER_ROW = 2;
const DESKTOP_ROWS = 10;
const MOBILE_ROWS = 14;
const MARQUEE_DURATION_SECONDS = 40;

export function HeroMarquee() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10">
      <div className="flex h-full flex-col justify-between py-6">
        {Array.from({ length: MOBILE_ROWS }).map((_, rowIndex) => {
          const delaySeconds =
            -(rowIndex * MARQUEE_DURATION_SECONDS) / MOBILE_ROWS;
          return (
            <div
              key={rowIndex}
              className={`overflow-hidden ${rowIndex >= DESKTOP_ROWS ? "lg:hidden" : ""}`}
            >
              <div
                className={`marquee-track ${rowIndex % 2 === 0 ? "marquee-l" : "marquee-r"} font-heading text-[clamp(2.5rem,6vw,4.5rem)] leading-none font-bold text-hero-fg/25 dark:text-gold/28`}
                style={{ animationDelay: `${delaySeconds}s` }}
              >
                {Array.from({ length: COPIES_PER_ROW }).map((_, copyIndex) => (
                  <span key={copyIndex}>{MARQUEE_TEXT}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
