"use client";

import { useMemo, useState } from "react";
import type { BorrowingRequestStatus } from "@/generated/prisma/client";
import { DataTable } from "@/components/DataTable";
import { columns, type RequestRow } from "./columns";
import {
  RequestStatusBadge,
  getRequestStatusLabel,
} from "@/components/RequestStatusBadge";
import { ExtensionBadge } from "@/components/ExtensionBadge";
import { confirmedExtensionCount } from "@/lib/loan-rules";
import { EntityCard } from "@/components/EntityCard";
import { CollapsibleGroup } from "@/components/CollapsibleGroup";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { FileText, SearchX, Hash, Calendar } from "lucide-react";
import { toggleSetValue } from "@/lib/utils";

const STATUS_GROUP_PRIORITY: BorrowingRequestStatus[] = [
  "overdue",
  "submitted",
  "reviewing",
  "contract_generated",
  "documents_uploaded",
  "ready_to_pickup",
  "active",
  "rejected",
  "cancelled",
  "returned",
];

function RequestCard({ request }: { request: RequestRow }) {
  return (
    <EntityCard
      href={`/admin/requests/${request.id}`}
      title={request.borrowerName}
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
        text: request.createdAt.toLocaleDateString("en-GB"),
      }}
    />
  );
}

export function RequestsExplorer({
  requests,
}: {
  requests: RequestRow[];
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
        request.borrowerYear,
        request.instrumentTypeRequested,
        getRequestStatusLabel(request.status),
        request.createdAt.toLocaleDateString("en-GB"),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [requests, search]);

  const mobileGroups = useMemo(() => {
    const map = new Map<BorrowingRequestStatus, RequestRow[]>();
    for (const request of filtered) {
      const list = map.get(request.status) ?? [];
      list.push(request);
      map.set(request.status, list);
    }
    return [...map.entries()]
      .sort(
        ([a], [b]) =>
          STATUS_GROUP_PRIORITY.indexOf(a) - STATUS_GROUP_PRIORITY.indexOf(b),
      )
      .map(
        ([status, items]) => [getRequestStatusLabel(status), items] as const,
      );
  }, [filtered]);

  return (
    <div className="flex flex-col gap-4">
      <div className="hidden flex-col gap-4 lg:flex">
        <Input
          placeholder="Search ticket ID, name, year, instrument, status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="text-xs text-muted-foreground">
          {filtered.length} dari {requests.length} pengajuan
        </div>

        {filtered.length === 0 ? (
          requests.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No requests"
              description="Submissions from the public form will show up here."
            />
          ) : (
            <EmptyState
              icon={SearchX}
              tone="search"
              title="No matching requests"
              description="Try a different search term."
            />
          )
        ) : (
          <DataTable data={filtered} columns={columns} />
        )}
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        <Input
          placeholder="Search requests…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="text-xs text-muted-foreground">
          {filtered.length} dari {requests.length} pengajuan
        </div>

        {filtered.length === 0 ? (
          requests.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No requests"
              description="Submissions from the public form will show up here."
            />
          ) : (
            <EmptyState
              icon={SearchX}
              tone="search"
              title="No matching requests"
              description="Try a different search term."
            />
          )
        ) : (
          <div className="flex flex-col">
            {mobileGroups.map(([statusLabel, items]) => (
              <CollapsibleGroup
                key={statusLabel}
                label={statusLabel}
                items={items}
                isCollapsed={collapsedGroups.has(statusLabel)}
                onToggle={() =>
                  setCollapsedGroups((prev) =>
                    toggleSetValue(prev, statusLabel),
                  )
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
