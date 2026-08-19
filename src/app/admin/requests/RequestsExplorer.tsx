"use client";

import { useMemo, useState } from "react";
import type { BorrowingRequest } from "@/generated/prisma/client";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";
import {
  RequestStatusBadge,
  getRequestStatusLabel,
} from "@/components/RequestStatusBadge";
import { EntityCard } from "@/components/EntityCard";
import { CollapsibleGroup } from "@/components/CollapsibleGroup";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { FileText, SearchX, Hash, Calendar } from "lucide-react";
import { toggleSetValue } from "@/lib/utils";

function RequestCard({ request }: { request: BorrowingRequest }) {
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
      topRight={<RequestStatusBadge status={request.status} />}
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
  requests: BorrowingRequest[];
}) {
  const [search, setSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  const mobileFiltered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return requests;
    return requests.filter((request) => {
      const haystack = [
        request.ticketId,
        request.borrowerName,
        request.borrowerYear,
        request.instrumentTypeRequested,
        getRequestStatusLabel(request.status),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [requests, search]);

  const mobileGroups = useMemo(() => {
    const map = new Map<string, BorrowingRequest[]>();
    for (const request of mobileFiltered) {
      const label = getRequestStatusLabel(request.status);
      const list = map.get(label) ?? [];
      list.push(request);
      map.set(label, list);
    }
    return [...map.entries()];
  }, [mobileFiltered]);

  return (
    <div className="flex flex-col gap-4">
      <div className="hidden lg:block">
        <DataTable data={requests} columns={columns} />
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        <Input
          placeholder="Search requests…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="text-xs text-muted-foreground">
          {mobileFiltered.length} dari {requests.length} pengajuan
        </div>

        {mobileFiltered.length === 0 ? (
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
