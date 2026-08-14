"use client";

import { useActionState } from "react";
import type { Good } from "@/generated/prisma/client";
import { updateGood, UpdateGoodState } from "./actions";

const initialState: UpdateGoodState = {
  error: null,
};

export function EditGoodForm({ good }: { good: Good }) {
  const action = updateGood.bind(null, good.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      {state.error && <p style={{ color: "red" }}>{state.error}</p>}
      <input
        name="name"
        defaultValue={good.name}
        placeholder="Name"
        required
      />
      <input
        name="brand"
        defaultValue={good.brand ?? ""}
        placeholder="Brand"
      />
      <input
        name="quantity"
        type="number"
        defaultValue={good.quantity}
        placeholder="Quantity"
      />

      <select name="condition" defaultValue={good.condition}>
        <option value="ok">OK</option>
        <option value="need_repair">Need Repair</option>
        <option value="retired">Retired</option>
        <option value="lost">Lost</option>
      </select>

      <input
        name="location"
        defaultValue={good.location}
        placeholder="Location"
      />
      <input
        name="registrationNo"
        defaultValue={good.registrationNo ?? ""}
        placeholder="Registration No."
      />
      <textarea
        name="notes"
        defaultValue={good.notes ?? ""}
        placeholder="Notes"
      />

      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
