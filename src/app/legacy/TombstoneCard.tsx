import Image from "next/image";
import type { Tombstone } from "@/generated/prisma/client";
import { formatKetuaLine, usesTwoStaffColumns } from "@/lib/legacy/legacy";
import { cn } from "@/lib/utils";

function StaffLines() {
  return (
    <span aria-hidden className="flex h-2.5 flex-1 flex-col justify-between">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className="h-px bg-border-strong" />
      ))}
    </span>
  );
}

export function TombstoneCard({ tombstone }: { tombstone: Tombstone }) {
  const twoColumns = usesTwoStaffColumns(tombstone.staffNames.length);

  return (
    <article className="flex w-[19.5rem] shrink-0 gold-hairline rounded-t-[9.75rem] rounded-b-2xl shadow-sm transition-shadow hover:shadow-[0_12px_36px_-12px_color-mix(in_oklab,var(--gold)_45%,transparent)]">
      <div className="legacy-plaque relative flex min-h-[36.75rem] flex-1 flex-col items-center gap-3 rounded-t-[9.75rem] rounded-b-2xl px-6 pt-7 pb-9 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-2.5 rounded-t-[9.25rem] rounded-b-xl border border-gold/30"
        />

        <span className="legacy-emblem-glow block">
          <span
            aria-hidden
            className="legacy-emblem block aspect-[1146/1820] h-[4.75rem]"
          />
        </span>

        <div className="font-heading text-h2 tabular text-gold-soft-foreground">
          {tombstone.termYear}
        </div>

        <div className="relative h-36 w-36 overflow-hidden rounded-2xl bg-muted ring-2 ring-gold/50 ring-offset-4 ring-offset-surface">
          <Image
            src={`/legacy/photo/${tombstone.id}`}
            alt={tombstone.ketuaName}
            fill
            unoptimized
            className="object-cover"
          />
        </div>

        <div className="mt-1 flex flex-col gap-0.5">
          <div className="font-heading text-h3 text-foreground">
            {tombstone.ketuaName}
          </div>
          <div className="text-caption text-foreground-2">
            {formatKetuaLine({
              section: tombstone.ketuaSection,
              angkatan: tombstone.ketuaAngkatan,
              termYear: tombstone.termYear,
            })}
          </div>
        </div>

        {tombstone.staffNames.length > 0 && (
          <div className="mt-3 flex w-full flex-col items-center gap-2.5">
            <div className="flex w-full items-center gap-3">
              <StaffLines />
              <span className="text-micro tracking-[0.2em] text-muted-foreground uppercase">
                Staffs
              </span>
              <StaffLines />
            </div>
            <ul
              className={cn(
                "grid w-full gap-x-4 gap-y-0.5 text-body text-foreground-2",
                twoColumns ? "grid-cols-2" : "grid-cols-1",
              )}
            >
              {tombstone.staffNames.map((name, index) => (
                <li
                  key={`${index}-${name}`}
                  className={cn(twoColumns && "last:odd:col-span-2")}
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
