"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { ItemCondition } from "@/generated/prisma/client";
import { createInstrument, CreateInstrumentState } from "./actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoanableCheckbox } from "@/components/LoanableCheckbox";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/components/ui/autocomplete";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONDITION_OPTIONS } from "@/components/StatusBadge";
import { isOutOfServiceCondition } from "@/lib/loan/loan-rules";
import { cn } from "@/lib/utils";
import { Notice } from "@/components/Notice";
import { Field, useFocusFirstInvalid } from "@/components/Field";
import { submitWithoutReset } from "@/lib/submit-without-reset";

const initialState: CreateInstrumentState = {
  error: null,
};

export function CreateInstrumentForm({
  sections,
  types,
}: {
  sections: string[];
  types: string[];
}) {
  const [state, formAction, isPending] = useActionState(
    createInstrument,
    initialState,
  );
  const [condition, setCondition] = useState<ItemCondition>("ok");
  const [isLoanable, setIsLoanable] = useState(true);
  const errors = state.fieldErrors ?? {};
  const formRef = useFocusFirstInvalid(state.fieldErrors);

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
        <Field label="Section" error={errors.section}>
          {(control) => (
            <Autocomplete name="section" items={sections}>
              <AutocompleteInput
                {...control}
                maxLength={100}
                placeholder="e.g. Strings"
                required
              />
              <AutocompleteContent>
                <AutocompleteEmpty>
                  No match — will be saved as a new section.
                </AutocompleteEmpty>
                <AutocompleteList>
                  {(item: string) => (
                    <AutocompleteItem key={item} value={item}>
                      {item}
                    </AutocompleteItem>
                  )}
                </AutocompleteList>
              </AutocompleteContent>
            </Autocomplete>
          )}
        </Field>

        <Field label="Type" error={errors.type}>
          {(control) => (
            <Autocomplete name="type" items={types}>
              <AutocompleteInput
                {...control}
                maxLength={100}
                placeholder="e.g. Timpani"
                required
              />
              <AutocompleteContent>
                <AutocompleteEmpty>
                  No match — will be saved as a new type.
                </AutocompleteEmpty>
                <AutocompleteList>
                  {(item: string) => (
                    <AutocompleteItem key={item} value={item}>
                      {item}
                    </AutocompleteItem>
                  )}
                </AutocompleteList>
              </AutocompleteContent>
            </Autocomplete>
          )}
        </Field>

        <Field label="Brand" optional language="en" error={errors.brand}>
          {(control) => <Input {...control} name="brand" maxLength={100} />}
        </Field>
        <Field
          label="Serial no."
          optional
          language="en"
          error={errors.serialNumber}
        >
          {(control) => (
            <Input {...control} name="serialNumber" maxLength={100} />
          )}
        </Field>

        <Field label="Location" error={errors.location}>
          {(control) => (
            <Input
              {...control}
              name="location"
              maxLength={100}
              defaultValue="Sekre"
              required
            />
          )}
        </Field>
        <Field label="Condition" error={errors.condition}>
          {(control) => (
            <Select
              name="condition"
              items={CONDITION_OPTIONS}
              value={condition}
              onValueChange={(value) => setCondition(value as ItemCondition)}
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

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <LoanableCheckbox
            blocked={isOutOfServiceCondition(condition)}
            checked={isLoanable}
            onCheckedChange={setIsLoanable}
          />
          <p className="text-xs text-foreground-2">
            Note: setting Condition to &quot;Pensiun&quot; or &quot;Hilang&quot;
            will force this off automatically, regardless of this checkbox.
          </p>
        </div>

        <Field
          label="Notes"
          optional
          language="en"
          error={errors.notes}
          className="sm:col-span-2"
        >
          {(control) => <Textarea {...control} name="notes" maxLength={1000} />}
        </Field>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create"}
        </Button>
        <Link
          href="/instruments"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
