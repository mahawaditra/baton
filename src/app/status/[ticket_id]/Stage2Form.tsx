"use client";

import { useActionState, useEffect } from "react";
import { submitStage2 } from "./actions";

const initialState = {
  success: false,
  error: null,
};

export function Stage2Form({
  ticketId,
  onSuccess,
}: {
  ticketId: string;
  onSuccess: () => void;
}) {
  const action = submitStage2.bind(null, ticketId);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction}>
      <h2>Complete your contract data</h2>
      {state.error && <p style={{ color: "red" }}>{state.error}</p>}

      <input name="ktpNumber" type="text" placeholder="KTP Number" required />
      <input
        name="addressKtp"
        type="text"
        placeholder="Address (as per KTP)"
        required
      />
      <input
        name="addressDomicile"
        type="text"
        placeholder="Current Address"
        required
      />
      <input name="faculty" type="text" placeholder="Faculty/Major" required />

      <h3>Guardian (Wali) Information</h3>
      <input
        name="guardianName"
        type="text"
        placeholder="Guardian Name"
        required
      />
      <input
        name="guardianPhone"
        type="text"
        placeholder="Guardian Phone"
        required
      />
      <input
        name="guardianAddressKtp"
        type="text"
        placeholder="Guardian Address (as per KTP)"
        required
      />

      <button type="submit" disabled={isPending}>
        {isPending ? "Generating..." : "Generate Contract"}
      </button>
    </form>
  );
}
