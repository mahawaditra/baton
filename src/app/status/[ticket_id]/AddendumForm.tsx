"use client";

import { useActionState, useEffect } from "react";
import { submitAddendum } from "./actions";

const initialState = {
  success: false,
  error: null,
};

export function AddendumForm({
  ticketId,
  timing = "initial",
  onSuccess,
}: {
  ticketId: string;
  timing?: "initial" | "final";
  onSuccess: () => void;
}) {
  const action = submitAddendum.bind(null, ticketId, timing);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  if (state.success) {
    return (
      <p>
        {timing === "initial"
          ? "Addendum submitted! Your borrowing is now being finalized by the admin."
          : "Addendum submitted! Please bring the instrument to Sekre for the admin to inspect and confirm the return."}
      </p>
    );
  }

  return (
    <form action={formAction}>
      <h3>
        {timing === "initial"
          ? "Initial Condition Addendum"
          : "Final Condition Addendum (Return)"}
      </h3>
      {timing === "initial" && (
        <p>
          Sebelum atau saat mengisi form ini, pastikan kamu sudah koordinasi
          jadwal pengambilan instrumen dengan staf Logistik OSUI (bisa dicek
          lewat email).
        </p>
      )}
      {state.error && <p style={{ color: "red" }}>{state.error}</p>}

      <label>
        Completeness (bow, case, rosin, etc.)
        <input name="completeness" type="text" required />
      </label>
      <label>
        Body Condition
        <textarea name="bodyCondition" required />
      </label>
      <label>
        Accessories Condition
        <textarea name="accessoriesCondition" />
      </label>
      <label>
        Notes
        <textarea name="notes" />
      </label>
      <label>
        Condition Photos
        <input name="photos" type="file" accept="image/*" multiple required />
      </label>
      <label>
        <input name="confirmedTruthful" type="checkbox" required />I confirm
        that the condition data above is truthful.
      </label>

      <button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Addendum"}
      </button>
    </form>
  );
}
