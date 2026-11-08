"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BorrowingRequestStatus } from "@/generated/prisma/client";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";
import type { RequestRow } from "./request-row";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { getRequestStatusLabel } from "@/lib/labels";
import { ExtensionBadge } from "@/components/ExtensionBadge";
import { confirmedExtensionCount, formatNameWithNickname } from "@/lib/loan/loan-rules";
import { EntityCard } from "@/components/EntityCard";
import { CollapsibleGroup } from "@/components/CollapsibleGroup";
import { MusicGlyph } from "@/components/MusicGlyph";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Hash, Calendar, SquareKanban, Table2 } from "lucide-react";
import { toggleSetValue } from "@/lib/utils";
import { formatJakartaDate, todayInJakarta } from "@/lib/format";
import {
  BOARD_COLUMNS,
  compareBoardRequests,
  getBoardColumn,
  type BoardColumn,
} from "@/lib/loan/board-rules";
import { TransferToOngoingButton } from "@/components/TransferToOngoingButton";
import { RequestsBoard } from "./RequestsBoard";
import { saveRequestsView, type RequestsView } from "./request-view";

const CLOSED_STATUS_ORDER: BorrowingRequestStatus[] = [
  "rejected",
  "cancelled",
  "returned",
];

function RequestCard({ request }: { request: RequestRow }) {
  return (
    <EntityCard
      href={`/requests/${request.id}`}
      title={formatNameWithNickname(request.borrowerName, request.borrowerNickname)}
      titleSuffix={
        <span className="tabular shrink-0 text-caption text-muted-foreground">
          {request.borrowerYear}
        </span>
      }
      subtitle={request.instrumentTypeRequested}
      topRight={
        <div className="flex shrink-0 items-center gap-1.5">
          <RequestStatusBadge status={request.status} />
          <ExtensionBadge
            count={confirmedExtensionCount(request.loanPeriods[0])}
          />
        </div>
      }
      metaLeft={[{ icon: Hash, text: request.ticketId }]}
      metaGrow={{
        icon: Calendar,
        text: formatJakartaDate(request.createdAt),
      }}
    />
  );
}

function ViewToggle({
  view,
  tableHref,
  boardHref,
}: {
  view: RequestsView;
  tableHref: string;
  boardHref: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [activeView, setActiveView] = useOptimistic(view);

  return (
    <SegmentedControl
      ariaLabel="Requests view"
      options={
        [
          { id: "table", label: "Table", icon: Table2, href: tableHref },
          { id: "board", label: "Board", icon: SquareKanban, href: boardHref },
        ] as const
      }
      value={activeView}
      onChange={(next) => {
        saveRequestsView(next);
        startTransition(() => {
          setActiveView(next);
          router.push(next === "table" ? tableHref : boardHref, {
            scroll: false,
          });
        });
      }}
      className="shrink-0"
    />
  );
}

export function RequestsExplorer({
  requests,
  view,
  tableHref,
  boardHref,
  filters,
  transferableCount,
}: {
  requests: RequestRow[];
  view: RequestsView;
  tableHref: string;
  boardHref: string;
  filters: React.ReactNode;
  transferableCount: number;
}) {
  const [search, setSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return requests;
    return requests.filter((request) => {
      const haystack = [
        request.ticketId,
        request.borrowerName,
        request.borrowerNickname,
        request.borrowerYear,
        request.instrumentTypeRequested,
        getRequestStatusLabel(request.status),
        formatJakartaDate(request.createdAt),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [requests, search]);

  const mobileGroups = useMemo(() => {
    const today = todayInJakarta();
    const workflow = new Map<BoardColumn, RequestRow[]>();
    const closed = new Map<BorrowingRequestStatus, RequestRow[]>();

    for (const request of filtered) {
      const column = getBoardColumn(request);
      if (column) {
        const list = workflow.get(column) ?? [];
        list.push(request);
        workflow.set(column, list);
      } else {
        const list = closed.get(request.status) ?? [];
        list.push(request);
        closed.set(request.status, list);
      }
    }

    const groups: { key: string; label: string; items: RequestRow[] }[] = [];
    for (const column of BOARD_COLUMNS) {
      const items = workflow.get(column.key);
      if (!items) continue;
      groups.push({
        key: column.key,
        label: column.label,
        items: [...items].sort((a, b) => compareBoardRequests(a, b, today)),
      });
    }
    for (const status of CLOSED_STATUS_ORDER) {
      const items = closed.get(status);
      if (items) {
        groups.push({
          key: status,
          label: getRequestStatusLabel(status),
          items,
        });
      }
    }
    return groups;
  }, [filtered]);

  const emptyState =
    requests.length === 0 ? (
      <EmptyState
        title="No requests"
        description="Submissions from the public form will show up here."
      />
    ) : (
      <EmptyState
        tone="search"
        title="No matching requests"
        description="Try a different search term."
      />
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="hidden flex-col gap-4 md:flex">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search ticket ID, name, year, instrument, status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <ViewToggle
            view={view}
            tableHref={tableHref}
            boardHref={boardHref}
          />
          <TransferToOngoingButton
            transferableCount={transferableCount}
            label="Transfer to Ongoing"
          />
        </div>

        {view !== "board" && <div>{filters}</div>}

        <div className="text-xs text-muted-foreground">
          {filtered.length} dari {requests.length} pengajuan
        </div>

        {filtered.length === 0 ? (
          emptyState
        ) : view === "board" ? (
          <RequestsBoard requests={filtered} />
        ) : (
          <DataTable data={filtered} columns={columns} />
        )}
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        <Input
          placeholder="Search requests…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div>{filters}</div>

        <div className="text-xs text-muted-foreground">
          {filtered.length} dari {requests.length} pengajuan
        </div>

        {filtered.length === 0 ? (
          emptyState
        ) : (
          <div className="flex flex-col">
            {mobileGroups.map(({ key, label, items }) => (
              <CollapsibleGroup
                key={key}
                label={
                  key === "ongoing" ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MusicGlyph glyph="fermata" className="text-[1rem]" />
                      {label}
                    </span>
                  ) : (
                    label
                  )
                }
                items={items}
                isCollapsed={collapsedGroups.has(key)}
                onToggle={() =>
                  setCollapsedGroups((prev) => toggleSetValue(prev, key))
                }
                renderItem={(request) => (
                  <RequestCard key={request.id} request={request} />
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
