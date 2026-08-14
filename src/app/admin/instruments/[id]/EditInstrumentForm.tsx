"use client";

import { useActionState } from "react";
import type { Instrument } from "@/generated/prisma/client";
import { updateInstrument, UpdateInstrumentState } from "./actions";

const initialState: UpdateInstrumentState = {
  error: null,
};

export function EditInstrumentForm({
  instrument,
  statusLocked,
}: {
  instrument: Instrument;
  statusLocked: boolean;
}) {
  const action = updateInstrument.bind(null, instrument.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      {state.error && <p style={{ color: "red" }}>{state.error}</p>}
      <input
        name="brand"
        defaultValue={instrument.brand ?? ""}
        placeholder="Brand"
      />
      <input
        name="serialNumber"
        defaultValue={instrument.serialNumber ?? ""}
        placeholder="Serial No."
      />

      <select name="condition" defaultValue={instrument.condition}>
        <option value="ok">OK</option>
        <option value="need_repair">Need Repair</option>
        <option value="retired">Retired</option>
        <option value="lost">Lost</option>
      </select>

      <select
        name="status"
        defaultValue={instrument.status}
        disabled={statusLocked}
      >
        <option value="available">Available</option>
        <option value="reserved">Reserved</option>
        <option value="borrowed">Borrowed</option>
        <option value="placed">Placed</option>
        <option value="unavailable">Unavailable</option>
      </select>
      {statusLocked && (
        <p style={{ color: "red" }}>
          Status cannot be changed while instrument is reserved or borrowed.
        </p>
      )}

      <label>
        <input
          type="checkbox"
          name="isLoanable"
          value="true"
          defaultChecked={instrument.isLoanable}
        />
        Loanable
      </label>
      <p style={{ fontSize: "0.85em", color: "#666" }}>
        Note: setting Condition to Retired or Lost will force this off
        automatically, regardless of this checkbox.
      </p>

      <input
        name="location"
        defaultValue={instrument.location}
        placeholder="Location"
      />
      <textarea
        name="notes"
        defaultValue={instrument.notes ?? ""}
        placeholder="Notes"
      />

      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
