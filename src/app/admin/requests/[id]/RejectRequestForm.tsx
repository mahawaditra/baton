"use client";

import { useActionState } from "react";
import { rejectRequest, RejectRequestState } from "./actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: RejectRequestState = {
  success: false,
  error: null,
};

export function RejectRequestForm({ requestId }: { requestId: string }) {
  const action = rejectRequest.bind(null, requestId);
  const [state, formAction, isPending] = useActionState(action, initialState);

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
          placeholder="Reason for rejection"
          required
        />
      </div>
      <Button
        type="submit"
        variant="destructive"
        disabled={isPending}
        className="self-start"
      >
        {isPending ? "Rejecting..." : "Reject Request"}
      </Button>
    </form>
  );
}
