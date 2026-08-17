"use client";

import { useActionState } from "react";
import type { LoanSetting } from "@/generated/prisma/client";
import { updateLoanSettings, UpdateLoanSettingsState } from "./actions";
import { CompressedImageInput } from "./CompressedImageInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p className="text-sm text-destructive" aria-live="polite">
          {state.error}
        </p>
      )}
      {state.success && (
        <p
          className="text-sm font-medium text-success-soft-foreground"
          aria-live="polite"
        >
          Loan settings saved.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Loan Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  defaultValue={
                    loanSettings?.dueDate?.toISOString().split("T")[0]
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="depositGraceDays">Deposit Grace Days</Label>
                <Input
                  id="depositGraceDays"
                  name="depositGraceDays"
                  type="number"
                  defaultValue={loanSettings?.depositGraceDays ?? 14}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="depositAmount">Deposit Amount (full)</Label>
                <Input
                  id="depositAmount"
                  name="depositAmount"
                  type="number"
                  defaultValue={loanSettings?.depositAmount ?? 100000}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="depositPartialAmount">
                  Deposit Amount (partial)
                </Label>
                <Input
                  id="depositPartialAmount"
                  name="depositPartialAmount"
                  type="number"
                  defaultValue={loanSettings?.depositPartialAmount ?? 50000}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  defaultValue={loanSettings?.bankName ?? ""}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bankAccount">Bank Account Number</Label>
                <Input
                  id="bankAccount"
                  name="bankAccount"
                  defaultValue={loanSettings?.bankAccount ?? ""}
                  required
                />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="bankHolder">Bank Account Holder</Label>
                <Input
                  id="bankHolder"
                  name="bankHolder"
                  defaultValue={loanSettings?.bankHolder ?? ""}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Signatory Data (PIHAK PERTAMA)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signatoryName">Name</Label>
              <Input
                id="signatoryName"
                name="signatoryName"
                defaultValue={loanSettings?.signatoryName ?? ""}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signatoryPhone">Phone</Label>
              <Input
                id="signatoryPhone"
                name="signatoryPhone"
                defaultValue={loanSettings?.signatoryPhone ?? ""}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signatoryLineId">LINE ID</Label>
              <Input
                id="signatoryLineId"
                name="signatoryLineId"
                defaultValue={loanSettings?.signatoryLineId ?? ""}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signatoryKtpNumber">KTP Number</Label>
              <Input
                id="signatoryKtpNumber"
                name="signatoryKtpNumber"
                defaultValue={loanSettings?.signatoryKtpNumber ?? ""}
                placeholder="16 digit"
                required
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="signatoryAddressKtp">Address (as per KTP)</Label>
              <Input
                id="signatoryAddressKtp"
                name="signatoryAddressKtp"
                defaultValue={loanSettings?.signatoryAddressKtp ?? ""}
                required
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="signatoryAddressDomicile">Current Address</Label>
              <Input
                id="signatoryAddressDomicile"
                name="signatoryAddressDomicile"
                defaultValue={loanSettings?.signatoryAddressDomicile ?? ""}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signatoryFaculty">Faculty/Major</Label>
              <Input
                id="signatoryFaculty"
                name="signatoryFaculty"
                defaultValue={loanSettings?.signatoryFaculty ?? ""}
                placeholder="Contoh: FT/Teknik Elektro"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signatoryYear">Year</Label>
              <Input
                id="signatoryYear"
                name="signatoryYear"
                defaultValue={loanSettings?.signatoryYear ?? ""}
                required
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="signatorySection">Section/Instrument</Label>
              <Input
                id="signatorySection"
                name="signatorySection"
                defaultValue={loanSettings?.signatorySection ?? ""}
                required
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="signatoryImage">
                Signature Image{" "}
                {loanSettings?.signatoryImageDriveId && (
                  <span className="font-normal text-muted-foreground">
                    (already uploaded — leave empty to keep current)
                  </span>
                )}
              </Label>
              <CompressedImageInput
                id="signatoryImage"
                name="signatoryImage"
                format="image/png"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : "Save Loan Settings"}
      </Button>
    </form>
  );
}
