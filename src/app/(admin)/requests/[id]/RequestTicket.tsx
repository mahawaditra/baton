import { Ban, Check } from "lucide-react";
import type { BorrowingRequestStatus } from "@/generated/prisma/enums";
import { NoticeRow } from "@/components/Notice";
import { TicketCard, TicketLabel } from "@/components/TicketCard";
import { getRequestStep, LOAN_STEP_LABELS } from "@/lib/loan/loan-rules";
import { cn } from "@/lib/utils";

function TicketField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <TicketLabel as="dt">{label}</TicketLabel>
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

const BOTTOM_SEGMENT_CLASS = "relative z-10 -mx-px -mb-px rounded-b-md";

const EXCEPTIONS = {
  rejected: { title: "Request rejected", tone: "danger", icon: undefined },
  cancelled: { title: "Request cancelled", tone: "neutral", icon: Ban },
  overdue: { title: "Overdue", tone: "danger", icon: undefined },
} as const;

function ExceptionSegment({
  status,
  reason,
}: {
  status: keyof typeof EXCEPTIONS;
  reason: string | null;
}) {
  const exception = EXCEPTIONS[status];
  const message =
    status === "overdue"
      ? "The borrower has not returned the instrument by the due date."
      : reason;
  return (
    <div
      className={cn(
        BOTTOM_SEGMENT_CLASS,
        "px-6 pt-[calc(1rem+1.5px)] pb-4",
        exception.tone === "neutral" ? "bg-muted" : "bg-destructive-soft",
      )}
    >
      <TearLine className="inset-x-3 border-border-strong" />
      <NoticeRow
        tone={exception.tone}
        icon={exception.icon}
        title={exception.title}
      >
        {message}
      </NoticeRow>
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
              state === "current" && "step-fill bg-gold text-hero-bg",
              state === "done" && "bg-muted text-muted-foreground",
              state === "upcoming" && "text-muted-foreground",
            )}
          >
            <TearLine
              className={cn(
                index === 0 && "right-3 left-3 lg:right-0",
                index > 0 && "hidden lg:block",
                index > 0 &&
                  (index === steps.length - 1 ? "right-3 left-0" : "inset-x-0"),
                state === "current"
                  ? "border-hero-bg/35"
                  : "border-border-strong",
              )}
            />
            <div className="flex items-center gap-1 text-micro uppercase">
              {state === "done" && (
                <Check
                  aria-hidden
                  className="h-3 w-3 text-primary"
                  strokeWidth={2}
                />
              )}
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
  const isException =
    status === "rejected" || status === "cancelled" || status === "overdue";
  return (
    <TicketCard
      topTone="hero"
      tearLine={false}
      perforated={!isException}
      bottomClassName="ticket-unfold"
      top={
        <div className="px-6 pt-5 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">{badges}</div>
              <h1 className="mt-2 text-h1">{title}</h1>
              <p className="mt-1 text-sm text-hero-fg/75">{subtitle}</p>
            </div>
            <div className="text-left sm:text-right">
              <TicketLabel>Ticket ID</TicketLabel>
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
        isException ? (
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
