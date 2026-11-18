"use client";

import type { ItemCondition } from "@/generated/prisma/client";
import { Field } from "@/components/Field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import type { FieldErrors } from "@/lib/form-errors";

export type GoodFieldValues = {
  name: string;
  brand: string | null;
  registrationNo: string | null;
  condition: ItemCondition;
  location: string;
  quantity: number;
  notes: string | null;
};

export function GoodFields({
  values,
  errors,
  locations,
}: {
  values: GoodFieldValues;
  errors: FieldErrors;
  locations: string[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Brand" optional language="en" error={errors.brand}>
        {(control) => (
          <Input
            {...control}
            name="brand"
            maxLength={100}
            defaultValue={values.brand ?? ""}
          />
        )}
      </Field>
      <Field
        label="Reg. no."
        optional
        language="en"
        error={errors.registrationNo}
      >
        {(control) => (
          <Input
            {...control}
            name="registrationNo"
            maxLength={100}
            defaultValue={values.registrationNo ?? ""}
          />
        )}
      </Field>

      <Field label="Name" error={errors.name}>
        {(control) => (
          <Input
            {...control}
            name="name"
            maxLength={100}
            defaultValue={values.name}
            required
          />
        )}
      </Field>
      <Field label="Condition" error={errors.condition}>
        {(control) => (
          <Select
            name="condition"
            items={CONDITION_OPTIONS}
            defaultValue={values.condition}
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

      <Field label="Location" error={errors.location}>
        {(control) => (
          <Autocomplete
            name="location"
            items={locations}
            defaultValue={values.location}
          >
            <AutocompleteInput {...control} maxLength={100} required />
            <AutocompleteContent>
              <AutocompleteEmpty>
                No match — will be saved as a new location.
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
      <Field label="Quantity" error={errors.quantity}>
        {(control) => (
          <Input
            {...control}
            name="quantity"
            type="number"
            defaultValue={values.quantity}
            required
          />
        )}
      </Field>

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
            defaultValue={values.notes ?? ""}
          />
        )}
      </Field>
    </div>
  );
}
