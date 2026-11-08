"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, staggerStyle } from "@/lib/utils";
import { HandbookAccordionRow } from "./HandbookAccordionRow";
import { HandbookCallout } from "./HandbookCallout";
import {
  TROUBLESHOOTING_GROUPS,
  TROUBLESHOOTING_OWNER_LABELS,
  filterTroubleshootingGroups,
  type TroubleshootingEntry,
  type TroubleshootingOwner,
} from "./troubleshooting-entries";

const OWNER_FILTERS = [
  { id: "all", label: "Semua" },
  { id: "self", label: "Sendiri" },
  { id: "ketua", label: "Ketua" },
  { id: "zenka", label: "Zenka" },
] as const;

const OWNER_CHIP_CLASS: Record<TroubleshootingOwner, string> = {
  self: "bg-success-soft text-success-soft-foreground",
  ketua: "bg-plum-soft text-foreground-2",
  zenka: "bg-gold-soft text-gold-soft-foreground",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-caption text-muted-foreground">{children}</div>;
}

function EntryRow({
  entry,
  defaultOpen,
}: {
  entry: TroubleshootingEntry;
  defaultOpen: boolean;
}) {
  return (
    <HandbookAccordionRow
      defaultOpen={defaultOpen}
      summary={
        <span className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <span className="text-label text-foreground">
            {entry.title}
            {entry.incidentDate && (
              <span className="tabular ml-2 font-normal text-caption text-muted-foreground">
                {entry.incidentDate}
              </span>
            )}
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-caption",
              OWNER_CHIP_CLASS[entry.owner],
            )}
          >
            {TROUBLESHOOTING_OWNER_LABELS[entry.owner]}
          </span>
        </span>
      }
    >
      <div className="flex flex-col gap-1">
        <FieldLabel>Kenapa</FieldLabel>
        {entry.why.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <FieldLabel>Yang harus dilakukan</FieldLabel>
        <ol className="flex list-decimal flex-col gap-1 pl-5">
          {entry.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
      {entry.note && <p className="text-foreground">{entry.note}</p>}
      {entry.warning && <HandbookCallout>{entry.warning}</HandbookCallout>}
    </HandbookAccordionRow>
  );
}

export function TroubleshootingExplorer() {
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState<TroubleshootingOwner | "all">("all");
  const isSearching = query.trim().length > 0;

  const groups = filterTroubleshootingGroups(
    TROUBLESHOOTING_GROUPS,
    query,
    owner,
  );

  function handleReset() {
    setQuery("");
    setOwner("all");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden
            strokeWidth={1.75}
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Cari masalah"
            placeholder="Cari gejala, misal: foto, LINE"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <SegmentedControl
          ariaLabel="Siapa yang bisa beresin"
          options={OWNER_FILTERS}
          value={owner}
          onChange={setOwner}
          className="w-full sm:w-fit sm:shrink-0"
        />
      </div>

      {groups.length === 0 ? (
        <EmptyState
          tone="search"
          title="Nggak ketemu"
          description="Coba kata lain, atau tanya Ketua dulu."
          action={
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset filter
            </Button>
          }
        />
      ) : (
        groups.map((group, groupIndex) => (
          <section
            key={group.label}
            data-stagger
            style={staggerStyle(groupIndex)}
            className="flex flex-col gap-2"
          >
            <h2 className="text-micro text-muted-foreground uppercase">
              {group.label}
            </h2>
            <div className="overflow-hidden rounded-md border border-border bg-card">
              {group.entries.map((entry) => (
                <EntryRow
                  key={`${entry.id}-${isSearching}`}
                  entry={entry}
                  defaultOpen={isSearching}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
