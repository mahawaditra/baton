"use client";

import { useActionState } from "react";
import { addAdmin, AddAdminState } from "./actions";

const initialState: AddAdminState = {
  success: false,
  error: null,
};

export function AddAdminForm() {
  const [state, formAction, isPending] = useActionState(addAdmin, initialState);

  return (
    <form action={formAction}>
      {state.error && <p style={{ color: "red" }}>{state.error}</p>}
      {state.success && (
        <p style={{ color: "green" }}>Admin added successfully.</p>
      )}
      <input name="email" type="email" placeholder="New admin email" required />
      <input name="name" type="text" placeholder="New admin name" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "Adding..." : "Add Admin"}
      </button>
    </form>
  );
}
