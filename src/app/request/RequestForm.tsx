"use client";

import { useActionState } from "react";
import { submitRequest } from "./actions";
import { REQUESTABLE_INSTRUMENT_TYPES } from "@/lib/constants";
import Link from "next/link";

const initialState = {
  ticketId: null,
  accessCode: null,
  error: null,
};

export function RequestForm() {
  const [state, formAction, isPending] = useActionState(
    submitRequest,
    initialState,
  );

  if (state.ticketId) {
    return (
      <div>
        <h2>Request Submitted!</h2>
        <p>
          Your Ticket ID: <strong>{state.ticketId}</strong>
        </p>
        <p>
          Your Access Code: <strong>{state.accessCode}</strong>
        </p>
        <p>
          We've sent a confirmation email to your inbox with your ticket ID and
          access code — if you don't see it within a few minutes, please check
          your Spam folder (and "Report not spam" if the option is available).
        </p>
        <p>
          Since this page won't show them again, noting down or screenshot the
          ticket ID and access code is well advised.
        </p>
        <Link href={`/status/${state.ticketId}`}>Go to my status page →</Link>
      </div>
    );
  }

  return (
    <form action={formAction}>
      {state.error && <p style={{ color: "red" }}>{state.error}</p>}
      <input name="name" type="text" placeholder="Full Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="phone" type="tel" placeholder="Phone Number" required />
      <input name="lineId" type="text" placeholder="LINE ID" required />
      <select name="instrumentType" required defaultValue="">
        <option value="" disabled>
          Select instrument...
        </option>
        {REQUESTABLE_INSTRUMENT_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <input name="year" type="text" placeholder="Year (angkatan)" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
