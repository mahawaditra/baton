"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import type { LoanSetting } from "@/generated/prisma/client";
import {
  updateLoanSettings,
  UpdateLoanSettingsState,
  setSignatoryPhonePublic,
} from "./actions";
import { CompressedImageInput } from "./CompressedImageInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicContactToggle } from "./PublicContactToggle";
import { LineContactToggle } from "./LineContactToggle";
import { splitFacultyMajor } from "@/lib/format";

const initialState: UpdateLoanSettingsState = {
  success: false,
  error: null,
};

export function LoanSettingsForm({
  loanSettings,
  canEdit,
}: {
  loanSettings: LoanSetting | null;
  canEdit: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    updateLoanSettings,
    initialState,
  );
  const signatoryFacultyMajor = splitFacultyMajor(loanSettings?.signatoryFaculty);
  const formRef = useRef<HTMLFormElement>(null);
  const [dirtyFields, setDirtyFields] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [prevState, setPrevState] = useState(state);

  if (state !== prevState) {
    setPrevState(state);
    if (state.success) setDirtyFields(new Set());
  }

  function handleFieldChange(event: React.FormEvent<HTMLFormElement>) {
    const field = event.target as HTMLInputElement;
    if (!field.name || field.closest("[data-autosave]")) return;
    const changed =
      field.type === "file"
        ? (field.files?.length ?? 0) > 0
        : field.value !== field.defaultValue;
    setDirtyFields((current) => {
      if (changed === current.has(field.name)) return current;
      const next = new Set(current);
      if (changed) next.add(field.name);
      else next.delete(field.name);
      return next;
    });
  }

  function handleDiscard() {
    formRef.current?.reset();
    setDirtyFields(new Set());
  }

  const isDirty = dirtyFields.size > 0;

  return (
    <form
      ref={formRef}
      action={formAction}
      onInput={handleFieldChange}
      onChange={handleFieldChange}
      className="flex flex-col gap-4"
    >
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
      {!canEdit && (
        <p className="text-sm text-foreground-2">
          Cuma Ketua (atau Overlord) yang bisa ubah Loan Settings. Kamu bisa
          liat isinya, tapi nggak bisa nyimpen perubahan.
        </p>
      )}

      <fieldset disabled={!canEdit} className="contents">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loan Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <div className="flex flex-col gap-1.5 sm:col-span-2">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signatoryAddressKtp">Address (as per KTP)</Label>
              <Input
                id="signatoryAddressKtp"
                name="signatoryAddressKtp"
                defaultValue={loanSettings?.signatoryAddressKtp ?? ""}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signatoryAddressDomicile">Current Address</Label>
              <Input
                id="signatoryAddressDomicile"
                name="signatoryAddressDomicile"
                defaultValue={loanSettings?.signatoryAddressDomicile ?? ""}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signatoryFaculty">Faculty</Label>
              <Input
                id="signatoryFaculty"
                name="signatoryFaculty"
                defaultValue={signatoryFacultyMajor.faculty}
                placeholder="Contoh: FT"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signatoryMajor">Major</Label>
              <Input
                id="signatoryMajor"
                name="signatoryMajor"
                defaultValue={signatoryFacultyMajor.major}
                placeholder="Contoh: Teknik Elektro"
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signatorySection">Section/Instrument</Label>
              <Input
                id="signatorySection"
                name="signatorySection"
                defaultValue={loanSettings?.signatorySection ?? ""}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="signatoryImage">
                Signature Image{" "}
                {loanSettings?.signatoryImageDriveId && (
                  <span className="font-normal text-muted-foreground">
                    (already uploaded — leave empty to keep current)
                  </span>
                )}
              </Label>
              <div className="flex items-center gap-3">
                {loanSettings?.signatoryImageDriveId && (
                  <div className="relative h-10 w-28 shrink-0 overflow-hidden rounded border border-border bg-hero-fg">
                    <Image
                      src={`/drive-files/${loanSettings.signatoryImageDriveId}`}
                      alt="Current signature printed on contracts"
                      fill
                      unoptimized
                      className="object-contain p-1"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <CompressedImageInput
                    id="signatoryImage"
                    name="signatoryImage"
                    format="image/png"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>
            <div
              data-autosave
              className="border-t border-border pt-4 sm:col-span-2"
            >
              <p className="mb-3 text-sm text-foreground-2">
                These show up as contact buttons on the public landing page,
                for people with questions. This applies immediately and
                independently from Save Loan Settings.
                {!canEdit && " Only Ketua or Overlord can change this."}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
                <PublicContactToggle
                  id="signatoryPhonePublic"
                  label="Enable WhatsApp"
                  defaultValue={loanSettings?.signatoryPhonePublic ?? false}
                  disabled={!canEdit}
                  action={setSignatoryPhonePublic}
                />
                <LineContactToggle
                  defaultChecked={loanSettings?.signatoryLineAddFriendPublic ?? false}
                  defaultUrl={loanSettings?.signatoryLineAddFriendUrl ?? ""}
                  disabled={!canEdit}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isDirty ? (
        <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-hero-bg px-4 py-3 text-hero-fg shadow-lg">
          <span className="text-sm">
            Unsaved changes in Loan Rules, Bank Account or Signatory Data
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleDiscard}
              disabled={isPending}
              className="text-hero-fg/80 hover:bg-hero-fg/10 hover:text-hero-fg"
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gold text-hero-bg hover:bg-gold-hover"
            >
              {isPending ? "Saving..." : "Save Loan Settings"}
            </Button>
          </div>
        </div>
      ) : (
        <Button type="submit" disabled={isPending} className="self-start">
          {isPending ? "Saving..." : "Save Loan Settings"}
        </Button>
      )}
      </fieldset>
    </form>
  );
}
