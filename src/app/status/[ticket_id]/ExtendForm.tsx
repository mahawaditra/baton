"use client";

import { useActionState, useEffect } from "react";
import { submitExtension } from "./actions";
import { RequestData } from "./types";

const initialState = {
  success: false,
  error: null,
};

export function ExtendForm({
  data,
  onSuccess,
}: {
  data: RequestData;
  onSuccess: () => void;
}) {
  const action = submitExtension.bind(null, data.ticketId);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction}>
      <h2>Extend your borrowing period</h2>
      <p>Please recheck your data below — edit if anything has changed.</p>
      {state.error && <p style={{ color: "red" }}>{state.error}</p>}

      <input
        name="ktpNumber"
        type="text"
        placeholder="KTP Number"
        defaultValue={data.borrowerKtpNumber ?? ""}
        required
      />
      <input
        name="addressKtp"
        type="text"
        placeholder="Address (as per KTP)"
        defaultValue={data.borrowerAddressKtp ?? ""}
        required
      />
      <input
        name="addressDomicile"
        type="text"
        placeholder="Current Address"
        defaultValue={data.borrowerAddressDomicile ?? ""}
        required
      />
      <input
        name="faculty"
        type="text"
        placeholder="Faculty/Major"
        defaultValue={data.borrowerFaculty ?? ""}
        required
      />

      <h3>Guardian (Wali) Information</h3>
      <input
        name="guardianName"
        type="text"
        placeholder="Guardian Name"
        defaultValue={data.guardianName ?? ""}
        required
      />
      <input
        name="guardianPhone"
        type="text"
        placeholder="Guardian Phone"
        defaultValue={data.guardianPhone ?? ""}
        required
      />
      <input
        name="guardianAddressKtp"
        type="text"
        placeholder="Guardian Address (as per KTP)"
        defaultValue={data.guardianAddressKtp ?? ""}
        required
      />

      <button type="submit" disabled={isPending}>
        {isPending ? "Generating..." : "Generate Extension Contract"}
      </button>
    </form>
  );
}
