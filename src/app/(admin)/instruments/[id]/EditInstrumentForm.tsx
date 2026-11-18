"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Instrument, ItemCondition } from "@/generated/prisma/client";
import { updateInstrument, UpdateInstrumentState } from "./actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Notice } from "@/components/Notice";
import { Field, useFocusFirstInvalid } from "@/components/Field";
import { submitWithoutReset } from "@/lib/submit-without-reset";

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
  const errors = state.fieldErrors ?? {};
  const formRef = useFocusFirstInvalid(state.fieldErrors);
  const lockedHint = (field: string) =>
    statusLocked
      ? `${field} can't be changed while the instrument is reserved or borrowed.`
      : undefined;

  return (
    <form
      ref={formRef}
      onSubmit={submitWithoutReset(formAction)}
      noValidate
      className="flex flex-col gap-4"
    >
      {state.error && (
        <Notice tone="danger" compact aria-live="polite">
          {state.error}
        </Notice>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Brand" optional language="en" error={errors.brand}>
          {(control) => (
            <Input
              {...control}
              name="brand"
              maxLength={100}
              defaultValue={instrument.brand ?? ""}
            />
          )}
        </Field>
        <Field
          label="Serial no."
          optional
          language="en"
          error={errors.serialNumber}
        >
          {(control) => (
            <Input
              {...control}
              name="serialNumber"
              maxLength={100}
              defaultValue={instrument.serialNumber ?? ""}
            />
          )}
        </Field>

        <Field label="Status" hint={lockedHint("Status")} error={errors.status}>
          {(control) => (
            <Select
              name="status"
              items={STATUS_OPTIONS}
              defaultValue={instrument.status}
              disabled={statusLocked}
            >
              <SelectTrigger {...control} className="w-full">
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
          )}
        </Field>
        <Field
          label="Condition"
          hint={lockedHint("Condition")}
          error={errors.condition}
        >
          {(control) => (
            <Select
              name="condition"
              items={CONDITION_OPTIONS}
              value={condition}
              onValueChange={(value) => setCondition(value as ItemCondition)}
              disabled={statusLocked}
            >
              <SelectTrigger {...control} className="w-full">
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
          )}
        </Field>

        <Field
          label="Location"
          hint={lockedHint("Location")}
          error={errors.location}
        >
          {(control) => (
            <Input
              {...control}
              name="location"
              maxLength={100}
              defaultValue={
                statusLocked ? displayLocation : instrument.location
              }
              disabled={statusLocked}
              required
            />
          )}
        </Field>
        <div className="flex flex-col gap-1.5">
          <span aria-hidden className="hidden h-5 sm:block" />
          <LoanableCheckbox
            blocked={isOutOfServiceCondition(condition)}
            checked={isLoanable}
            onCheckedChange={setIsLoanable}
          />
        </div>

        <Field
          label="Notes"
          optional
          language="en"
          error={errors.notes}
          className="sm:col-span-2"
        >
          {(control) => (
            <Textarea
              {...control}
              name="notes"
              maxLength={1000}
              defaultValue={instrument.notes ?? ""}
            />
          )}
        </Field>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
        <Link
          href={`/instruments/${instrument.id}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
