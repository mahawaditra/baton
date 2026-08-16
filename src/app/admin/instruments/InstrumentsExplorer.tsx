"use client";

import { useMemo, useState } from "react";
import type { Instrument } from "@/generated/prisma/client";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";
import { getStatusLabel, getConditionLabel } from "@/components/StatusBadge";
import { FacetFilter } from "@/components/FacetFilter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { Boxes, SearchX } from "lucide-react";

function toggle(set: Set<string>, value: string) {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export function InstrumentsExplorer({
  instruments,
}: {
  instruments: Instrument[];
}) {
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());

  function handleReset() {
    setSearch("");
    setSectionFilter(new Set());
    setTypeFilter(new Set());
  }

  const sections = useMemo(
    () => [...new Set(instruments.map((i) => i.section))].sort(),
    [instruments],
  );
  const types = useMemo(
    () => [...new Set(instruments.map((i) => i.type))].sort(),
    [instruments],
  );

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cari section, tipe, merk, nomor seri, lokasi…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <FacetFilter
          label="Section"
          options={sections}
          selected={sectionFilter}
          onToggle={(value) => setSectionFilter((prev) => toggle(prev, value))}
        />
        <FacetFilter
          label="Type"
          options={types}
          selected={typeFilter}
          onToggle={(value) => setTypeFilter((prev) => toggle(prev, value))}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        {filtered.length} dari {instruments.length} instrumen
      </div>

      {filtered.length === 0 ? (
        instruments.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="Belum ada instrumen"
            description="Instrumen yang ditambahkan admin akan muncul di sini."
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
  );
}
