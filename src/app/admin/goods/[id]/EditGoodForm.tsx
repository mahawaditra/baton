"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Good } from "@/generated/prisma/client";
import { updateGood, UpdateGoodState } from "./actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const initialState: UpdateGoodState = {
  error: null,
};

export function EditGoodForm({ good }: { good: Good }) {
  const action = updateGood.bind(null, good.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p className="text-sm text-destructive" aria-live="polite">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={good.name} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" name="brand" defaultValue={good.brand ?? ""} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            defaultValue={good.quantity}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="condition">Condition</Label>
          <Select name="condition" defaultValue={good.condition}>
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
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          defaultValue={good.location}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="registrationNo">Reg. No.</Label>
        <Input
          id="registrationNo"
          name="registrationNo"
          defaultValue={good.registrationNo ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={good.notes ?? ""} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
        <Link
          href={`/admin/goods/${good.id}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
