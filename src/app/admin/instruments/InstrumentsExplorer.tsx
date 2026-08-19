"use client";

import { useMemo, useState } from "react";
import type { Instrument, InstrumentStatus } from "@/generated/prisma/client";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";
import {
  StatusBadge,
  getStatusLabel,
  getConditionLabel,
} from "@/components/StatusBadge";
import { FacetFilter } from "@/components/FacetFilter";
import { EntityCard } from "@/components/EntityCard";
import { CollapsibleGroup } from "@/components/CollapsibleGroup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { Boxes, SearchX, Hash, MapPin } from "lucide-react";
import { cn, toggleSetValue } from "@/lib/utils";

const MOBILE_SORT_OPTIONS = [
  { id: "section", label: "Section" },
  { id: "type", label: "Instrument" },
] as const;

type MobileSort = (typeof MOBILE_SORT_OPTIONS)[number]["id"];

const STATUS_VALUES: InstrumentStatus[] = [
  "available",
  "reserved",
  "borrowed",
  "placed",
  "unavailable",
];

function InstrumentCard({ instrument }: { instrument: Instrument }) {
  return (
    <EntityCard
      href={`/admin/instruments/${instrument.id}`}
      title={instrument.type}
      subtitle={instrument.brand}
      topRight={
        <StatusBadge status={instrument.status} condition={instrument.condition} />
      }
      metaLeft={[{ icon: Hash, text: instrument.serialNumber }]}
      metaGrow={{ icon: MapPin, text: instrument.location }}
    />
  );
}

export function InstrumentsExplorer({
  instruments,
  action,
}: {
  instruments: Instrument[];
  action?: React.ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [mobileSort, setMobileSort] = useState<MobileSort>("section");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

  function handleReset() {
    setSearch("");
    setSectionFilter(new Set());
    setTypeFilter(new Set());
    setStatusFilter(new Set());
  }

  const sections = useMemo(
    () => [...new Set(instruments.map((i) => i.section))].sort(),
    [instruments],
  );
  const types = useMemo(
    () => [...new Set(instruments.map((i) => i.type))].sort(),
    [instruments],
  );
  const statusOptions = useMemo(() => STATUS_VALUES.map(getStatusLabel), []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return instruments.filter((instrument) => {
      if (sectionFilter.size > 0 && !sectionFilter.has(instrument.section)) {
        return false;
      }
      if (typeFilter.size > 0 && !typeFilter.has(instrument.type)) {
        return false;
      }
      if (!query) return true;
      const haystack = [
        instrument.section,
        instrument.type,
        instrument.brand,
        instrument.serialNumber,
        instrument.location,
        getStatusLabel(instrument.status),
        getConditionLabel(instrument.condition),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [instruments, search, sectionFilter, typeFilter]);

  const mobileFiltered = useMemo(() => {
    if (statusFilter.size === 0) return filtered;
    return filtered.filter((instrument) =>
      statusFilter.has(getStatusLabel(instrument.status)),
    );
  }, [filtered, statusFilter]);

  const mobileGroups = useMemo(() => {
    if (mobileSort !== "section") return null;
    const map = new Map<string, Instrument[]>();
    for (const instrument of mobileFiltered) {
      const list = map.get(instrument.section) ?? [];
      list.push(instrument);
      map.set(instrument.section, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [mobileFiltered, mobileSort]);

  const mobileFlat = useMemo(() => {
    if (mobileSort === "section") return null;
    return [...mobileFiltered].sort((a, b) =>
      (a[mobileSort] ?? "").localeCompare(b[mobileSort] ?? ""),
    );
  }, [mobileFiltered, mobileSort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="hidden flex-col gap-4 lg:flex">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search section, type, brand, serial number, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <FacetFilter
            label="Section"
            options={sections}
            selected={sectionFilter}
            onToggle={(value) =>
              setSectionFilter((prev) => toggleSetValue(prev, value))
            }
          />
          <FacetFilter
            label="Type"
            options={types}
            selected={typeFilter}
            onToggle={(value) =>
              setTypeFilter((prev) => toggleSetValue(prev, value))
            }
          />
          {action && <div className="ml-auto">{action}</div>}
        </div>

        <div className="text-xs text-muted-foreground">
          {filtered.length} dari {instruments.length} instrumen
        </div>

        {filtered.length === 0 ? (
          instruments.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="No instruments yet"
              description="Instruments added by admin will appear here."
            />
          ) : (
            <EmptyState
              icon={SearchX}
              tone="search"
              title="No matching instruments"
              description="Try a different search term, or reset the filters below."
              action={
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset filters
                </Button>
              }
            />
          )
        ) : (
          <DataTable data={filtered} columns={columns} />
        )}
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        <Input
          placeholder="Search instruments…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="text-xs text-muted-foreground">
          {mobileFiltered.length} dari {instruments.length} instrumen
        </div>

        <div className="-mx-2 overflow-x-auto px-2">
          <div className="flex items-center gap-2">
            <div className="inline-flex shrink-0 gap-0.5 rounded-lg border border-border bg-surface-2 p-[3px]">
              {MOBILE_SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMobileSort(opt.id)}
                  className={cn(
                    "whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium text-muted-foreground",
                    mobileSort === opt.id &&
                      "bg-surface font-semibold text-foreground shadow-sm",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="h-5 w-px shrink-0 bg-border" />
            <div className="flex shrink-0 gap-2">
              <FacetFilter
                label="Section"
                options={sections}
                selected={sectionFilter}
                onToggle={(value) =>
                  setSectionFilter((prev) => toggleSetValue(prev, value))
                }
              />
              <FacetFilter
                label="Type"
                options={types}
                selected={typeFilter}
                onToggle={(value) =>
                  setTypeFilter((prev) => toggleSetValue(prev, value))
                }
              />
              <FacetFilter
                label="Status"
                options={statusOptions}
                selected={statusFilter}
                onToggle={(value) =>
                  setStatusFilter((prev) => toggleSetValue(prev, value))
                }
              />
            </div>
          </div>
        </div>

        {mobileFiltered.length === 0 ? (
          instruments.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="No instruments yet"
              description="Instruments added by admin will appear here."
            />
          ) : (
            <EmptyState
              icon={SearchX}
              tone="search"
              title="No matching instruments"
              description="Try a different search term, or reset the filters below."
              action={
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset filters
                </Button>
              }
            />
          )
        ) : mobileGroups ? (
          <div className="flex flex-col">
            {mobileGroups.map(([sectionLabel, items]) => (
              <CollapsibleGroup
                key={sectionLabel}
                label={sectionLabel}
                items={items}
                isCollapsed={collapsedSections.has(sectionLabel)}
                onToggle={() =>
                  setCollapsedSections((prev) =>
                    toggleSetValue(prev, sectionLabel),
                  )
                }
                renderItem={(instrument) => (
                  <InstrumentCard key={instrument.id} instrument={instrument} />
                )}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {mobileFlat!.map((instrument) => (
              <InstrumentCard key={instrument.id} instrument={instrument} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
