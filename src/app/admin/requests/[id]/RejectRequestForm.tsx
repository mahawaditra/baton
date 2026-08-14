"use client";

import { useActionState } from "react";
import { rejectRequest, RejectRequestState } from "./actions";

const initialState: RejectRequestState = {
  success: false,
  error: null,
};

export function RejectRequestForm({ requestId }: { requestId: string }) {
  const action = rejectRequest.bind(null, requestId);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      {state.error && <p style={{ color: "red" }}>{state.error}</p>}
      <textarea name="reason" placeholder="Reason for rejection" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "Rejecting..." : "Reject Request"}
      </button>
    </form>
  );
}
