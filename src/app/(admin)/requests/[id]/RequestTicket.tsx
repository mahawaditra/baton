import { AlertTriangle, Ban } from "lucide-react";
import type { BorrowingRequestStatus } from "@/generated/prisma/enums";
import { TicketCard } from "@/components/TicketCard";
import { getRequestStep, LOAN_STEP_LABELS } from "@/lib/loan/loan-rules";
import { cn } from "@/lib/utils";

function TicketField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-micro uppercase text-gold dark:text-gold-soft-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 truncate font-medium">{value}</dd>
    </div>
  );
}

function TearLine({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-0 border-t-[1.5px] border-dashed",
        className,
      )}
    />
  );
}

function stepState(index: number, current: number, finished: boolean) {
  if (finished || index < current - 1) return "done";
  if (index === current - 1) return "current";
  return "upcoming";
}

const DIVIDER_POSITIONS = ["25%", "50%", "75%"];

const BOTTOM_SEGMENT_CLASS = "relative z-10 -mx-px -mb-px rounded-b-md";

const EXCEPTIONS = {
  rejected: { title: "Request Rejected", icon: AlertTriangle, muted: false },
  cancelled: { title: "Request Cancelled", icon: Ban, muted: true },
  overdue: { title: "Overdue", icon: AlertTriangle, muted: false },
} as const;

function ExceptionSegment({
  status,
  reason,
}: {
  status: keyof typeof EXCEPTIONS;
  reason: string | null;
}) {
  const exception = EXCEPTIONS[status];
  const Icon = exception.icon;
  const message =
    status === "overdue"
      ? "The borrower has not returned the instrument by the due date."
      : reason;
  return (
    <div
      className={cn(
        BOTTOM_SEGMENT_CLASS,
        "flex items-start gap-3 px-6 pt-[calc(1rem+1.5px)] pb-4 text-sm",
        exception.muted ? "bg-muted" : "bg-destructive-soft",
      )}
    >
      <TearLine className="inset-x-3 border-border-strong" />
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          exception.muted ? "text-muted-foreground" : "text-destructive",
        )}
        strokeWidth={1.75}
      />
      <div>
        <div
          className={cn(
            "font-semibold",
            exception.muted ? "text-foreground" : "text-destructive",
          )}
        >
          {exception.title}
        </div>
        {message && <div className="mt-0.5 text-foreground-2">{message}</div>}
      </div>
    </div>
  );
}

function StepSegments({
  status,
  instrumentConfirmed,
}: {
  status: BorrowingRequestStatus;
  instrumentConfirmed: boolean;
}) {
  const step = getRequestStep(status, instrumentConfirmed);
  const current = step === "exception" ? 0 : step;
  const finished = status === "returned";
  const steps = LOAN_STEP_LABELS.map((label, index) =>
    index === 3 && finished ? "Returned" : label,
  );
  return (
    <div className="relative">
      <ol
        className={cn(
          BOTTOM_SEGMENT_CLASS,
          "grid grid-cols-1 overflow-hidden lg:grid-cols-4",
        )}
      >
        {steps.map((label, index) => {
          const state = stepState(index, current, finished);
          return (
            <li
              key={label}
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "relative px-5 pt-[calc(1rem+1.5px)] pb-4",
                index > 0 &&
                  "border-t-2 border-dashed border-border-strong lg:border-t-0 lg:border-l-2",
                state === "current" && "bg-gold text-hero-bg",
                state === "done" && "bg-muted text-muted-foreground",
                state === "upcoming" && "text-muted-foreground",
              )}
            >
              <TearLine
                className={cn(
                  index === 0 && "right-3 left-3 lg:right-0",
                  index > 0 && "hidden lg:block",
                  index > 0 &&
                    (index === steps.length - 1
                      ? "right-3 left-0"
                      : "inset-x-0"),
                  state === "current"
                    ? "border-hero-bg/35"
                    : "border-border-strong",
                )}
              />
              <div className="text-micro uppercase">
                Step {index + 1}
                {state === "current" && " · Current"}
                {state === "done" && " · Done"}
              </div>
              <div
                className={cn(
                  "mt-0.5 text-sm",
                  state === "current" ? "font-bold" : "font-medium",
                )}
              >
                {label}
              </div>
            </li>
          );
        })}
      </ol>
      {DIVIDER_POSITIONS.map((left) => (
        <span key={left} aria-hidden>
          <span
            className="pointer-events-none absolute -top-2 z-20 hidden h-4 w-4 -translate-x-1/2 rounded-full border border-border bg-background lg:block"
            style={{ left }}
          />
          <span
            className="pointer-events-none absolute -bottom-[9px] z-20 hidden h-4 w-4 -translate-x-1/2 rounded-full border border-border bg-background lg:block"
            style={{ left }}
          />
        </span>
      ))}
    </div>
  );
}

export function RequestTicket({
  badges,
  title,
  ticketId,
  subtitle,
  fields,
  status,
  instrumentConfirmed,
  rejectionReason,
  cancellationReason,
  actions,
}: {
  badges: React.ReactNode;
  title: React.ReactNode;
  ticketId: string;
  subtitle: React.ReactNode;
  fields: { label: string; value: string }[];
  status: BorrowingRequestStatus;
  instrumentConfirmed: boolean;
  rejectionReason: string | null;
  cancellationReason: string | null;
  actions?: React.ReactNode;
}) {
  return (
    <TicketCard
      topTone="hero"
      tearLine={false}
      top={
        <div className="px-6 pt-5 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">{badges}</div>
              <h1 className="mt-2 text-h1">{title}</h1>
              <p className="mt-1 text-sm text-hero-fg/75">{subtitle}</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-micro uppercase text-gold dark:text-gold-soft-foreground">
                Ticket ID
              </div>
              <div className="tabular font-heading text-h1">{ticketId}</div>
              {actions && (
                <div className="mt-3 flex flex-wrap gap-2 sm:justify-end">
                  {actions}
                </div>
              )}
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-hero-fg/15 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-[0.6fr_1.6fr_1fr_1fr]">
            {fields.map((field) => (
              <TicketField
                key={field.label}
                label={field.label}
                value={field.value}
              />
            ))}
          </dl>
        </div>
      }
      bottom={
        status === "rejected" ||
        status === "cancelled" ||
        status === "overdue" ? (
          <ExceptionSegment
            status={status}
            reason={
              status === "rejected" ? rejectionReason : cancellationReason
            }
          />
        ) : (
          <StepSegments
            status={status}
            instrumentConfirmed={instrumentConfirmed}
          />
        )
      }
    />
  );
}
