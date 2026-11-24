const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?";
const FLIP_MS = 60;

function scrambleCharacter(index: number, step: number) {
  return CHARSET.charAt((index * 131 + step * 71 + 17) % CHARSET.length);
}

export function ScrambleText({
  text,
  delayMs = 0,
  leadMs = 300,
  revealStepMs = 120,
  className,
  encryptedClassName,
  revealedClassName,
}: {
  text: string;
  delayMs?: number;
  leadMs?: number;
  revealStepMs?: number;
  className?: string;
  encryptedClassName?: string;
  revealedClassName?: string;
}) {
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {Array.from(text).map((char, index) => {
          if (char === " ") return <span key={index}> </span>;
          const durationMs = leadMs + index * revealStepMs;
          const steps = Math.max(1, Math.round(durationMs / FLIP_MS));
          return (
            <span
              key={index}
              className="scramble-cell"
              style={
                {
                  "--scramble-steps": steps,
                  "--scramble-duration": `${durationMs}ms`,
                  "--scramble-delay": `${delayMs}ms`,
                } as React.CSSProperties
              }
            >
              <span className="scramble-final">{char}</span>
              <span className="scramble-strip">
                {Array.from({ length: steps }, (_, step) => (
                  <span key={step} className={encryptedClassName}>
                    {scrambleCharacter(index, step)}
                  </span>
                ))}
                <span className={revealedClassName}>{char}</span>
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
