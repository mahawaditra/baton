"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Instrument, ItemCondition } from "@/generated/prisma/client";
import { updateInstrument, UpdateInstrumentState } from "./actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoanableCheckbox } from "@/components/LoanableCheckbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONDITION_OPTIONS, STATUS_OPTIONS } from "@/components/StatusBadge";
import { isOutOfServiceCondition } from "@/lib/loan/loan-rules";
import { cn } from "@/lib/utils";

const initialState: UpdateInstrumentState = {
  error: null,
};

export function EditInstrumentForm({
  instrument,
  statusLocked,
  displayLocation,
}: {
  instrument: Instrument;
  statusLocked: boolean;
  displayLocation: string;
}) {
  const action = updateInstrument.bind(null, instrument.id);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [condition, setCondition] = useState<ItemCondition>(
    instrument.condition,
  );
  const [isLoanable, setIsLoanable] = useState(instrument.isLoanable);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p className="text-sm text-destructive" aria-live="polite">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            name="brand"
            defaultValue={instrument.brand ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="serialNumber">Serial No.</Label>
          <Input
            id="serialNumber"
            name="serialNumber"
            defaultValue={instrument.serialNumber ?? ""}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            name="status"
            items={STATUS_OPTIONS}
            defaultValue={instrument.status}
            disabled={statusLocked}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {statusLocked && (
            <p className="text-xs text-destructive">
              Status cannot be changed while instrument is reserved or borrowed.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="condition">Condition</Label>
          <Select
            name="condition"
            items={CONDITION_OPTIONS}
            value={condition}
            onValueChange={(value) => setCondition(value as ItemCondition)}
            disabled={statusLocked}
          >
            <SelectTrigger id="condition" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {statusLocked && (
            <p className="text-xs text-destructive">
              Condition cannot be changed while instrument is reserved or
              borrowed.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            defaultValue={statusLocked ? displayLocation : instrument.location}
            disabled={statusLocked}
          />
          {statusLocked && (
            <p className="text-xs text-destructive">
              Location cannot be changed while instrument is reserved or
              borrowed.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <span aria-hidden className="hidden h-5 sm:block" />
          <LoanableCheckbox
            blocked={isOutOfServiceCondition(condition)}
            checked={isLoanable}
            onCheckedChange={setIsLoanable}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={instrument.notes ?? ""}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
        <Link
          href={`/admin/instruments/${instrument.id}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
