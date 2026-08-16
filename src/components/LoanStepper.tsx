import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoanStepper({
  steps,
  current,
}: {
  steps: readonly string[];
  current: number;
}) {
  return (
    <ol className="grid grid-cols-4 gap-0">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isDone = stepNumber < current;
        const isActive = stepNumber === current;

        return (
          <li
            key={label}
            className="relative flex flex-col items-center gap-2.5"
          >
            {index > 0 && (
              <span
                className={cn(
                  "absolute top-4 -left-1/2 right-1/2 h-0.5",
                  stepNumber < current ? "bg-navy" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                isDone && "bg-navy text-background",
                isActive &&
                  "bg-gold text-background shadow-[0_0_0_4px_var(--gold-soft)]",
                !isDone &&
                  !isActive &&
                  "border-[1.5px] border-border-strong bg-surface text-muted-foreground",
              )}
            >
              {isDone ? (
                <Check className="h-4 w-4" strokeWidth={2.5} />
              ) : (
                stepNumber
              )}
            </span>
            <span
              className={cn(
                "text-center text-xs",
                isActive && "font-semibold text-foreground",
                isDone && "text-foreground-2",
                !isDone && !isActive && "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
