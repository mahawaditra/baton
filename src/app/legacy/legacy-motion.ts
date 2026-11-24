export const CREW_ENTER_MS = { featured: 350, first: 480, step: 70 };

export function legacyEnterDelay(ms: number) {
  return { "--legacy-delay": `${ms}ms` } as React.CSSProperties;
}
