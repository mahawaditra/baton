"use client";

import { useActionState, useEffect } from "react";
import { cancelRequest, CancelRequestState } from "./actions";
import { toastError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: CancelRequestState = {
  success: false,
  error: null,
  generalError: null,
};

export function CancelRequestForm({ requestId }: { requestId: string }) {
  const action = cancelRequest.bind(null, requestId);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.generalError) toastError(state.generalError);
  }, [state.generalError]);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      {state.error && (
        <p className="text-sm text-destructive" aria-live="polite">
          {state.error}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          name="reason"
          placeholder="Why is this request being cancelled?"
          required
        />
      </div>
      <Button
        type="submit"
        variant="destructive"
        disabled={isPending}
        className="self-start"
      >
        {isPending ? "Cancelling..." : "Cancel Request"}
      </Button>
    </form>
  );
}
