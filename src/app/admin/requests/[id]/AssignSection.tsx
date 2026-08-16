"use client";

import { useState } from "react";
import type { Instrument } from "@/generated/prisma/client";
import { assignInstrument } from "./actions";
import { ConditionIndicator, getConditionLabel } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

export function AssignSection({
  requestId,
  currentInstrument,
  candidates,
}: {
  requestId: string;
  currentInstrument: Instrument | null;
  candidates: Instrument[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handlePick(instrumentId: string) {
    setPendingId(instrumentId);
    setError(null);
    try {
      const result = await assignInstrument(requestId, instrumentId);
      if (!result.success) {
        setError(result.error ?? "Failed to assign instrument.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to assign instrument.",
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="text-sm text-destructive" aria-live="polite">
          {error}
        </p>
      )}

      {currentInstrument && (
        <div className="flex items-center gap-3 rounded-md border border-navy bg-gold-soft/35 p-3">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-navy">
            <span className="h-1.5 w-1.5 rounded-full bg-navy" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">
              {currentInstrument.brand}
              {currentInstrument.serialNumber && (
                <span className="tabular font-normal text-muted-foreground">
                  {" "}
                  · {currentInstrument.serialNumber}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ConditionIndicator condition={currentInstrument.condition} />
              {getConditionLabel(currentInstrument.condition)}
            </div>
          </div>
          <span className="shrink-0 text-xs font-semibold text-navy">
            Assigned
          </span>
        </div>
      )}

      {candidates.length === 0 && !currentInstrument && (
        <p className="text-sm text-muted-foreground">
          No matching instruments available to assign right now.
        </p>
      )}

      {candidates.length > 0 && (
        <>
          {currentInstrument && (
            <div className="mt-1 text-xs font-medium text-muted-foreground">
              Reassign to a different instrument:
            </div>
          )}
          {candidates.map((inst) => (
            <button
              key={inst.id}
              type="button"
              onClick={() => handlePick(inst.id)}
              disabled={pendingId !== null}
              className={cn(
                "flex items-center gap-3 rounded-md border border-border p-3 text-left transition-colors hover:bg-muted",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              <span className="h-4 w-4 shrink-0 rounded-full border-2 border-border-strong" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">
                  {inst.brand}
                  {inst.serialNumber && (
                    <span className="tabular font-normal text-muted-foreground">
                      {" "}
                      · {inst.serialNumber}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ConditionIndicator condition={inst.condition} />
                  {getConditionLabel(inst.condition)}
                  {inst.location && <span> · {inst.location}</span>}
                </div>
              </div>
              <span className="shrink-0 text-xs font-medium text-navy">
                {pendingId === inst.id ? "Assigning…" : "Assign"}
              </span>
            </button>
          ))}
        </>
      )}
    </div>
  );
}
