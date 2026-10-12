"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Calendar,
  CircleAlert,
  Clock,
  Hash,
  Hourglass,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineIcon, WhatsAppIcon } from "@/components/ContactLink";
import { ExtensionBadge } from "@/components/ExtensionBadge";
import {
  confirmedExtensionCount,
  formatNameWithNickname,
} from "@/lib/loan/loan-rules";
import {
  BOARD_COLUMNS,
  compareBoardRequests,
  getBoardChip,
  getBoardColumn,
  getDocumentApprovalProgress,
  type BoardChipTone,
  type BoardColumn,
  type BoardSortDirection,
} from "@/lib/loan/board-rules";
import {
  formatCalendarDate,
  formatJakartaDate,
  formatRelativeDays,
  toWhatsAppNumber,
  todayInJakarta,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RequestRow } from "./request-row";

const BOARD_BOTTOM_GAP = 32;
const BOARD_MIN_HEIGHT = 360;

const CHIP_STYLES: Record<
  BoardChipTone,
  { className: string; icon: LucideIcon }
> = {
  action: {
    className: "bg-gold-soft text-gold-soft-foreground",
    icon: CircleAlert,
  },
  waiting: { className: "bg-muted text-foreground-2", icon: Hourglass },
  ok: {
    className: "bg-success-soft text-success-soft-foreground",
    icon: Clock,
  },
  late: {
    className: "bg-destructive-soft text-destructive",
    icon: AlertTriangle,
  },
};

function formatInstrumentLine(request: RequestRow): string {
  return [
    request.instrumentTypeRequested,
    request.instrument?.brand,
    request.instrument?.serialNumber
      ? `SN ${request.instrument.serialNumber}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function BoardCard({ request }: { request: RequestRow }) {
  const chip = getBoardChip(request);
  const progress = getDocumentApprovalProgress(request);
  const latestPeriod = request.loanPeriods[0];
  const isLoanStage =
    request.status === "active" || request.status === "overdue";
  const chipStyle = chip ? CHIP_STYLES[chip.tone] : null;
  const ChipIcon = chipStyle?.icon;

  return (
    <div className="relative flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 shadow-sm transition-transform has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 active:translate-y-px">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/requests/${request.id}`}
          className="min-w-0 flex-1 text-sm font-semibold text-foreground outline-none after:absolute after:inset-0 after:rounded-lg"
        >
          {formatNameWithNickname(
            request.borrowerName,
            request.borrowerNickname,
          )}
        </Link>
        <span className="tabular shrink-0 text-caption text-muted-foreground">
          {request.borrowerYear}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-caption text-muted-foreground">
          {formatInstrumentLine(request)}
        </span>
        <ExtensionBadge
          count={confirmedExtensionCount(request.loanPeriods[0])}
        />
      </div>

      {chip && chipStyle && ChipIcon && (
        <span
          className={`flex w-fit max-w-full items-start gap-1.5 rounded-sm px-2 py-1 text-xs font-medium leading-4 ${chipStyle.className}`}
        >
          <ChipIcon className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          {chip.label}
        </span>
      )}

      {progress && (
        <div className="flex flex-col gap-1">
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${(progress.approved / progress.total) * 100}%`,
              }}
            />
          </div>
          <span className="tabular text-micro text-muted-foreground">
            {progress.approved}/{progress.total} approved
          </span>
        </div>
      )}

      {request.status === "ready_to_pickup" && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <a
            href={`https://wa.me/${toWhatsAppNumber(request.borrowerPhone)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tabular relative z-10 flex items-center gap-1 hover:text-foreground hover:underline"
          >
            <WhatsAppIcon className="h-3 w-3 shrink-0" />
            {request.borrowerPhone}
          </a>
          <span className="tabular flex items-center gap-1">
            <LineIcon className="h-3 w-3 shrink-0" />
            {request.borrowerLineId}
          </span>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-dashed border-border pt-2 text-xs text-muted-foreground">
        <span className="tabular flex items-center gap-1">
          <Hash className="h-3 w-3 shrink-0" strokeWidth={1.75} />
          {request.ticketId}
        </span>
        <span
          title={isLoanStage ? undefined : formatJakartaDate(request.createdAt)}
          className={cn(
            "tabular flex items-center gap-1",
            chip?.tone === "late" && "text-destructive",
          )}
        >
          <Calendar className="h-3 w-3 shrink-0" strokeWidth={1.75} />
          {isLoanStage && latestPeriod
            ? `Due ${formatCalendarDate(latestPeriod.dueDate)}`
            : formatRelativeDays(request.createdAt)}
        </span>
      </div>
    </div>
  );
}

function BoardColumnView({
  label,
  items,
  direction,
  onToggleSort,
}: {
  label: string;
  items: RequestRow[];
  direction: BoardSortDirection;
  onToggleSort: () => void;
}) {
  const isNewestFirst = direction === "newest";
  const SortIcon = isNewestFirst ? ArrowDownWideNarrow : ArrowUpNarrowWide;
  const sortHint = isNewestFirst
    ? "Sorted newest first. Click for oldest first."
    : "Sorted oldest first. Click for newest first.";

  return (
    <section className="flex w-72 shrink-0 snap-start flex-col rounded-lg bg-muted/40">
      <header className="flex shrink-0 items-center gap-2 py-3 pr-2 pl-3.5">
        <h2 className="text-sm font-semibold text-foreground">{label}</h2>
        <span className="tabular flex h-5 min-w-6 items-center justify-center rounded-full bg-muted px-2 text-xs font-medium text-foreground-2">
          {items.length}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="ml-auto text-muted-foreground"
          onClick={onToggleSort}
          title={sortHint}
          aria-label={sortHint}
        >
          {isNewestFirst ? "Newest" : "Oldest"}
          <SortIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Button>
      </header>
      <div className="scrollbar-subtle flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto [scrollbar-gutter:stable] pt-0.5 pr-0.5 pb-2.5 pl-2.5">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-caption text-muted-foreground">
            No requests
          </div>
        ) : (
          items.map((request) => (
            <BoardCard key={request.id} request={request} />
          ))
        )}
      </div>
    </section>
  );
}

export function RequestsBoard({ requests }: { requests: RequestRow[] }) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [sortDirections, setSortDirections] = useState<
    Partial<Record<BoardColumn, BoardSortDirection>>
  >({});
  const { grouped, closedCount } = useMemo(() => {
    const today = todayInJakarta();
    const groups = new Map<BoardColumn, RequestRow[]>();
    let closed = 0;

    for (const request of requests) {
      const column = getBoardColumn(request);
      if (!column) {
        closed += 1;
        continue;
      }
      const list = groups.get(column) ?? [];
      list.push(request);
      groups.set(column, list);
    }

    for (const [column, list] of groups) {
      const direction = sortDirections[column] ?? "oldest";
      list.sort((a, b) => compareBoardRequests(a, b, today, direction));
    }

    return { grouped: groups, closedCount: closed };
  }, [requests, sortDirections]);

  function toggleSort(column: BoardColumn) {
    setSortDirections((current) => ({
      ...current,
      [column]: (current[column] ?? "oldest") === "oldest" ? "newest" : "oldest",
    }));
  }

  const visibleColumns = BOARD_COLUMNS.filter(
    (column) => column.key !== "ongoing" || grouped.has("ongoing"),
  );

  useLayoutEffect(() => {
    const element = boardRef.current;
    if (!element) return;

    const fitToViewport = () => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      const available = window.innerHeight - top - BOARD_BOTTOM_GAP;
      element.style.height = `${Math.max(BOARD_MIN_HEIGHT, available)}px`;
    };

    fitToViewport();
    window.addEventListener("resize", fitToViewport);
    return () => window.removeEventListener("resize", fitToViewport);
  }, [closedCount]);

  return (
    <div className="flex flex-col gap-3">
      {closedCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {closedCount} pengajuan ditolak atau dibatalkan tidak ditampilkan di
          board. Lihat di Table.
        </p>
      )}
      <div
        ref={boardRef}
        className="scrollbar-subtle flex items-stretch gap-3 overflow-x-auto max-lg:snap-x max-lg:snap-mandatory"
      >
        {visibleColumns.map((column) => (
          <BoardColumnView
            key={column.key}
            label={column.label}
            items={grouped.get(column.key) ?? []}
            direction={sortDirections[column.key] ?? "oldest"}
            onToggleSort={() => toggleSort(column.key)}
          />
        ))}
      </div>
    </div>
  );
}
