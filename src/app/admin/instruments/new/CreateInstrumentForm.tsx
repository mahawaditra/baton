"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createInstrument, CreateInstrumentState } from "./actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p className="text-sm text-destructive" aria-live="polite">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="condition">Condition</Label>
          <Select name="condition" defaultValue="ok">
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
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue="Sekre" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="isLoanable" value="true" defaultChecked />
          Loanable
        </label>
        <p className="text-xs text-muted-foreground">
          Note: setting Condition to Retired or Lost will force this off
          automatically, regardless of this checkbox.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" />
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
