"use client";

import { useActionState } from "react";
import type { LoanSetting } from "@/generated/prisma/client";
import { updateLoanSettings, UpdateLoanSettingsState } from "./actions";
import { CompressedImageInput } from "./CompressedImageInput";

const initialState: UpdateLoanSettingsState = {
  success: false,
  error: null,
};

export function LoanSettingsForm({
  loanSettings,
}: {
  loanSettings: LoanSetting | null;
}) {
  const [state, formAction, isPending] = useActionState(
    updateLoanSettings,
    initialState,
  );

  return (
    <form action={formAction}>
      {state.error && <p style={{ color: "red" }}>{state.error}</p>}
      {state.success && (
        <p style={{ color: "green" }}>Loan settings saved.</p>
      )}
      <label>
        Due Date
        <input
          name="dueDate"
          type="date"
          defaultValue={loanSettings?.dueDate?.toISOString().split("T")[0]}
          required
        />
      </label>
      <label>
        Deposit Amount (full)
        <input
          name="depositAmount"
          type="number"
          defaultValue={loanSettings?.depositAmount ?? 100000}
          required
        />
      </label>
      <label>
        Deposit Amount (partial)
        <input
          name="depositPartialAmount"
          type="number"
          defaultValue={loanSettings?.depositPartialAmount ?? 50000}
          required
        />
      </label>
      <label>
        Deposit Grace Days
        <input
          name="depositGraceDays"
          type="number"
          defaultValue={loanSettings?.depositGraceDays ?? 14}
          required
        />
      </label>
      <label>
        Bank Name
        <input
          name="bankName"
          type="text"
          defaultValue={loanSettings?.bankName ?? ""}
          required
        />
      </label>
      <label>
        Bank Account Number
        <input
          name="bankAccount"
          type="text"
          defaultValue={loanSettings?.bankAccount ?? ""}
          required
        />
      </label>
      <label>
        Bank Account Holder
        <input
          name="bankHolder"
          type="text"
          defaultValue={loanSettings?.bankHolder ?? ""}
          required
        />
      </label>
      <h3>Signatory Data (PIHAK PERTAMA)</h3>
      <label>
        Name
        <input
          name="signatoryName"
          type="text"
          defaultValue={loanSettings?.signatoryName ?? ""}
          required
        />
      </label>
      <label>
        Phone
        <input
          name="signatoryPhone"
          type="text"
          defaultValue={loanSettings?.signatoryPhone ?? ""}
          required
        />
      </label>
      <label>
        LINE ID
        <input
          name="signatoryLineId"
          type="text"
          defaultValue={loanSettings?.signatoryLineId ?? ""}
          required
        />
      </label>
      <label>
        Address (as per KTP)
        <input
          name="signatoryAddressKtp"
          type="text"
          defaultValue={loanSettings?.signatoryAddressKtp ?? ""}
          required
        />
      </label>
      <label>
        Current Address
        <input
          name="signatoryAddressDomicile"
          type="text"
          defaultValue={loanSettings?.signatoryAddressDomicile ?? ""}
          required
        />
      </label>
      <label>
        Faculty/Major
        <input
          name="signatoryFaculty"
          type="text"
          defaultValue={loanSettings?.signatoryFaculty ?? ""}
          required
        />
      </label>
      <label>
        Year
        <input
          name="signatoryYear"
          type="text"
          defaultValue={loanSettings?.signatoryYear ?? ""}
          required
        />
      </label>
      <label>
        Section/Instrument
        <input
          name="signatorySection"
          type="text"
          defaultValue={loanSettings?.signatorySection ?? ""}
          required
        />
      </label>
      <label>
        KTP Number
        <input
          name="signatoryKtpNumber"
          type="text"
          defaultValue={loanSettings?.signatoryKtpNumber ?? ""}
          required
        />
      </label>
      <label>
        Signature Image{" "}
        {loanSettings?.signatoryImageDriveId &&
          "(already uploaded — leave empty to keep current)"}
        <CompressedImageInput name="signatoryImage" format="image/png" />
      </label>
      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Loan Settings"}
      </button>
    </form>
  );
}
