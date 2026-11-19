"use client";

import { useMemo, useState } from "react";
import type { Good, ItemCondition } from "@/generated/prisma/client";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";
import { ConditionIndicator, getConditionLabel } from "@/components/StatusBadge";
import { FacetFilter } from "@/components/FacetFilter";
import { EntityCard } from "@/components/EntityCard";
import { CollapsibleGroup } from "@/components/CollapsibleGroup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { Hash, MapPin } from "lucide-react";
import { toggleSetValue } from "@/lib/utils";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useTableFit } from "@/lib/use-table-fit";

const MOBILE_SORT_OPTIONS = [
  { id: "location", label: "Location" },
  { id: "name", label: "Name" },
] as const;

type MobileSort = (typeof MOBILE_SORT_OPTIONS)[number]["id"];

const CONDITION_VALUES: ItemCondition[] = ["ok", "need_repair", "retired", "lost"];

function GoodCard({ good }: { good: Good }) {
  return (
    <EntityCard
      href={`/goods/${good.id}`}
      title={good.name}
      titleSuffix={
        good.quantity !== 1 && (
          <span className="tabular shrink-0 text-caption text-muted-foreground">
            ×{good.quantity}
          </span>
        )
      }
      subtitle={good.brand}
      topRight={<ConditionIndicator condition={good.condition} />}
      metaLeft={
        good.registrationNo
          ? [{ icon: Hash, text: good.registrationNo }]
          : []
      }
      metaGrow={{ icon: MapPin, text: good.location }}
    />
  );
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
  const [conditionFilter, setConditionFilter] = useState<Set<string>>(
    new Set(),
  );
  const [mobileSort, setMobileSort] = useState<MobileSort>("location");
  const { rootRef, tableFits, onOverflow } = useTableFit();

  function handleReset() {
    setSearch("");
    setLocationFilter(new Set());
    setConditionFilter(new Set());
  }

  const locations = useMemo(
    () => [...new Set(goods.map((g) => g.location))].sort(),
    [goods],
  );
  const conditionOptions = useMemo(
    () => CONDITION_VALUES.map(getConditionLabel),
    [],
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

  const mobileFiltered = useMemo(() => {
    if (conditionFilter.size === 0) return filtered;
    return filtered.filter((good) =>
      conditionFilter.has(getConditionLabel(good.condition)),
    );
  }, [filtered, conditionFilter]);

  const mobileGroups = useMemo(() => {
    if (mobileSort !== "location") return null;
    const map = new Map<string, Good[]>();
    for (const good of mobileFiltered) {
      const list = map.get(good.location) ?? [];
      list.push(good);
      map.set(good.location, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [mobileFiltered, mobileSort]);

  const mobileFlat = useMemo(() => {
    if (mobileSort === "location") return null;
    return [...mobileFiltered].sort((a, b) => a.name.localeCompare(b.name));
  }, [mobileFiltered, mobileSort]);

  const emptyState =
    goods.length === 0 ? (
      <EmptyState
        title="No goods yet"
        description="Goods added by admin will appear here."
      />
    ) : (
      <EmptyState
        tone="search"
        title="No matching goods"
        description="Try a different search term, or reset the filters below."
        action={
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset filters
          </Button>
        }
      />
    );

  const cardList =
    mobileFiltered.length === 0 ? (
      emptyState
    ) : mobileGroups ? (
      <div className="flex flex-col">
        {mobileGroups.map(([locationLabel, items]) => (
          <CollapsibleGroup
            key={locationLabel}
            label={locationLabel}
            items={items}
            renderItem={(good) => <GoodCard key={good.id} good={good} />}
          />
        ))}
      </div>
    ) : (
      <div className="flex flex-col gap-2.5">
        {mobileFlat!.map((good) => (
          <GoodCard key={good.id} good={good} />
        ))}
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div ref={rootRef} className="hidden flex-col gap-4 lg:flex">
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
            onToggle={(value) =>
              setLocationFilter((prev) => toggleSetValue(prev, value))
            }
          />
          {action && <div className="ml-auto">{action}</div>}
        </div>

        <div className="text-xs text-muted-foreground">
          {filtered.length} of {goods.length} goods
        </div>

        {filtered.length === 0 ? (
          emptyState
        ) : tableFits ? (
          <DataTable
            data={filtered}
            columns={columns}
            getRowHref={(good) => `/goods/${good.id}`}
            linkColumn="name"
            onOverflow={onOverflow}
          />
        ) : (
          cardList
        )}
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        <Input
          placeholder="Search goods…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="text-xs text-muted-foreground">
          {mobileFiltered.length} of {goods.length} goods
        </div>

        <div className="flex flex-col gap-2 sm:-mx-2 sm:flex-row sm:items-center sm:overflow-x-auto sm:px-2">
          <SegmentedControl
            options={MOBILE_SORT_OPTIONS}
            value={mobileSort}
            onChange={setMobileSort}
            className="w-full sm:w-fit sm:shrink-0"
          />
          <div className="hidden shrink-0 bg-border sm:block sm:h-5 sm:w-px" />
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-fit sm:shrink-0">
            <FacetFilter
              label="Location"
              options={locations}
              selected={locationFilter}
              onToggle={(value) =>
                setLocationFilter((prev) => toggleSetValue(prev, value))
              }
              className="w-full sm:w-fit"
            />
            <FacetFilter
              label="Condition"
              options={conditionOptions}
              selected={conditionFilter}
              onToggle={(value) =>
                setConditionFilter((prev) => toggleSetValue(prev, value))
              }
              className="w-full sm:w-fit"
            />
          </div>
        </div>

        {cardList}
      </div>
    </div>
  );
}
