"use client";

import { useActionState } from "react";
import { addAdmin, AddAdminState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AddAdminState = {
  success: false,
  error: null,
};

export function AddAdminForm() {
  const [state, formAction, isPending] = useActionState(addAdmin, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.error && (
        <p className="text-sm text-destructive" aria-live="polite">
          {state.error}
        </p>
      )}
      {state.success && (
        <p
          className="text-sm font-medium text-[oklch(0.4_0.07_148)]"
          aria-live="polite"
        >
          Admin added successfully.
        </p>
      )}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="newAdminEmail">Email</Label>
          <Input
            id="newAdminEmail"
            name="email"
            type="email"
            placeholder="New admin email"
            required
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="newAdminName">Name</Label>
          <Input
            id="newAdminName"
            name="name"
            type="text"
            placeholder="New admin name"
            required
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding..." : "Add Admin"}
        </Button>
      </div>
    </form>
  );
}
