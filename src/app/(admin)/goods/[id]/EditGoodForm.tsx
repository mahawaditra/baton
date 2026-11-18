"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Good } from "@/generated/prisma/client";
import { updateGood, UpdateGoodState } from "./actions";
import { GoodFields } from "../GoodFields";
import { Button, buttonVariants } from "@/components/ui/button";
import { useFocusFirstInvalid } from "@/components/Field";
import { Notice } from "@/components/Notice";
import { submitWithoutReset } from "@/lib/submit-without-reset";
import { cn } from "@/lib/utils";

const initialState: UpdateGoodState = {
  error: null,
};

export function EditGoodForm({
  good,
  locations,
}: {
  good: Good;
  locations: string[];
}) {
  const action = updateGood.bind(null, good.id);
  const [state, formAction, isPending] = useActionState(action, initialState);
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
        values={good}
        errors={state.fieldErrors ?? {}}
        locations={locations}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
        <Link
          href={`/goods/${good.id}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
