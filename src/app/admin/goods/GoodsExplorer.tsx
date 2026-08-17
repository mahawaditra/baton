"use client";

import { useMemo, useState } from "react";
import type { Good } from "@/generated/prisma/client";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";
import { getConditionLabel } from "@/components/StatusBadge";
import { FacetFilter } from "@/components/FacetFilter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { Package, SearchX } from "lucide-react";

function toggle(set: Set<string>, value: string) {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export function GoodsExplorer({
  goods,
  action,
}: {
  goods: Good[];
  action?: React.ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState<Set<string>>(new Set());

  function handleReset() {
    setSearch("");
    setLocationFilter(new Set());
  }

  const locations = useMemo(
    () => [...new Set(goods.map((g) => g.location))].sort(),
    [goods],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return goods.filter((good) => {
      if (locationFilter.size > 0 && !locationFilter.has(good.location)) {
        return false;
      }
      if (!query) return true;
      const haystack = [
        good.name,
        good.brand,
        good.location,
        good.registrationNo,
        getConditionLabel(good.condition),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [goods, search, locationFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search name, brand, location, registration no…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <FacetFilter
          label="Location"
          options={locations}
          selected={locationFilter}
          onToggle={(value) => setLocationFilter((prev) => toggle(prev, value))}
        />
        {action && <div className="ml-auto">{action}</div>}
      </div>

      <div className="text-xs text-muted-foreground">
        {filtered.length} dari {goods.length} barang
      </div>

      {filtered.length === 0 ? (
        goods.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No goods yet"
            description="Goods added by admin will appear here."
          />
        ) : (
          <EmptyState
            icon={SearchX}
            tone="search"
            title="No matching goods"
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
