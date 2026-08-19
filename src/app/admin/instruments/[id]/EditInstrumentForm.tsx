"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Instrument } from "@/generated/prisma/client";
import { updateInstrument, UpdateInstrumentState } from "./actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const initialState: UpdateInstrumentState = {
  error: null,
};

export function EditInstrumentForm({
  instrument,
  statusLocked,
}: {
  instrument: Instrument;
  statusLocked: boolean;
}) {
  const action = updateInstrument.bind(null, instrument.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

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
          <Label htmlFor="condition">Condition</Label>
          <Select
            name="condition"
            defaultValue={instrument.condition}
            disabled={statusLocked}
          >
            <SelectTrigger id="condition" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ok">OK</SelectItem>
              <SelectItem value="need_repair">Need Repair</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
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
          <Label htmlFor="status">Status</Label>
          <Select
            name="status"
            defaultValue={instrument.status}
            disabled={statusLocked}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="borrowed">Borrowed</SelectItem>
              <SelectItem value="placed">Placed</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
          {statusLocked && (
            <p className="text-xs text-destructive">
              Status cannot be changed while instrument is reserved or borrowed.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            name="isLoanable"
            value="true"
            defaultChecked={instrument.isLoanable}
          />
          Loanable
        </label>
        <p className="text-xs text-muted-foreground">
          Note: setting Condition to Retired or Lost will force this off
          automatically, regardless of this checkbox.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          defaultValue={instrument.location}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={instrument.notes ?? ""}
        />
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
