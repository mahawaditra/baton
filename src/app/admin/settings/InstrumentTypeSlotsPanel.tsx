"use client";

import { useState, useTransition } from "react";
import { adjustInstrumentTypeSlot } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus } from "lucide-react";
import { toastError } from "@/lib/toast";

function InstrumentTypeSlotRow({
  type,
  initialSlot,
  isSuperAdmin,
}: {
  type: string;
  initialSlot: number;
  isSuperAdmin: boolean;
}) {
  const [slot, setSlot] = useState(initialSlot);
  const [pending, startTransition] = useTransition();

  function adjust(direction: "increase" | "decrease") {
    const previous = slot;
    setSlot(direction === "increase" ? previous + 1 : previous - 1);
    startTransition(async () => {
      try {
        const result = await adjustInstrumentTypeSlot(type, direction);
        if (result.success) {
          setSlot(result.value);
        } else {
          setSlot(previous);
          toastError(result.error);
        }
      } catch (err) {
        setSlot(previous);
        toastError(
          err instanceof Error ? err.message : "Couldn't save that. Try again.",
        );
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
      <span className="font-medium">{type}</span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          disabled={!isSuperAdmin || pending || slot <= 1}
          onClick={() => adjust("decrease")}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="tabular w-6 text-center font-semibold">{slot}</span>
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          disabled={!isSuperAdmin || pending}
          onClick={() => adjust("increase")}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function InstrumentTypeSlotsPanel({
  rows,
  isSuperAdmin,
}: {
  rows: { type: string; maxConcurrentLoans: number }[];
  isSuperAdmin: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instrument Availability Slots</CardTitle>
      </CardHeader>
      <CardContent className="gap-3">
        {!isSuperAdmin && (
          <p className="text-sm text-foreground-2">
            Hanya Super Admin yang bisa ubah slot ini. Kamu bisa liat isinya,
            tapi nggak bisa ubah.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <InstrumentTypeSlotRow
              key={row.type}
              type={row.type}
              initialSlot={row.maxConcurrentLoans}
              isSuperAdmin={isSuperAdmin}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
