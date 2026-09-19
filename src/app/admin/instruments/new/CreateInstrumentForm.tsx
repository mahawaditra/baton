"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { ItemCondition } from "@/generated/prisma/client";
import { createInstrument, CreateInstrumentState } from "./actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { isOutOfServiceCondition } from "@/lib/loan-rules";
import { cn } from "@/lib/utils";

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

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p className="text-sm text-destructive" aria-live="polite">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="section">Section</Label>
          <Autocomplete name="section" items={sections}>
            <AutocompleteInput id="section" placeholder="e.g. Strings" />
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
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">Type</Label>
          <Autocomplete name="type" items={types}>
            <AutocompleteInput id="type" placeholder="e.g. Timpani" />
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
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" name="brand" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="serialNumber">Serial No.</Label>
          <Input id="serialNumber" name="serialNumber" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue="Sekre" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="condition">Condition</Label>
          <Select
            name="condition"
            items={CONDITION_OPTIONS}
            value={condition}
            onValueChange={(value) => setCondition(value as ItemCondition)}
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
        </div>

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

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create"}
        </Button>
        <Link
          href="/admin/instruments"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
