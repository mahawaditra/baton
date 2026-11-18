"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createGood, CreateGoodState } from "./actions";
import { GoodFields } from "../GoodFields";
import { Button, buttonVariants } from "@/components/ui/button";
import { useFocusFirstInvalid } from "@/components/Field";
import { Notice } from "@/components/Notice";
import { submitWithoutReset } from "@/lib/submit-without-reset";
import { cn } from "@/lib/utils";

const initialState: CreateGoodState = {
  error: null,
};

const NEW_GOOD = {
  name: "",
  brand: null,
  registrationNo: null,
  condition: "ok",
  location: "RB1",
  quantity: 1,
  notes: null,
} as const;

export function CreateGoodForm({ locations }: { locations: string[] }) {
  const [state, formAction, isPending] = useActionState(
    createGood,
    initialState,
  );
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

      <GoodFields
        values={NEW_GOOD}
        errors={state.fieldErrors ?? {}}
        locations={locations}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create"}
        </Button>
        <Link
          href="/goods"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
