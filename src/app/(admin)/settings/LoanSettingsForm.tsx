"use client";

import { useActionState, useState } from "react";
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
import { Notice } from "@/components/Notice";
import { Field, useFocusFirstInvalid } from "@/components/Field";
import type { FieldErrors } from "@/lib/form-errors";
import { submitWithoutReset } from "@/lib/submit-without-reset";

function SettingsField({
  name,
  label,
  type,
  maxLength,
  defaultValue,
  placeholder,
  className,
  errors,
}: {
  name: string;
  label: string;
  type?: "date" | "number";
  maxLength?: number;
  defaultValue?: string | number;
  placeholder?: string;
  className?: string;
  errors: FieldErrors;
}) {
  return (
    <Field label={label} error={errors[name]} className={className}>
      {(control) => (
        <Input
          {...control}
          name={name}
          type={type}
          maxLength={maxLength}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required
        />
      )}
    </Field>
  );
}

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
  const errors = state.fieldErrors ?? {};
  const formRef = useFocusFirstInvalid(state.fieldErrors);
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
      onSubmit={submitWithoutReset(formAction)}
      noValidate
      onInput={handleFieldChange}
      onChange={handleFieldChange}
      className="flex flex-col gap-4"
    >
      {state.error && (
        <Notice tone="danger" compact aria-live="polite">
          {state.error}
        </Notice>
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
          Only the Ketua (or Overlord) can change loan settings. You can view
          them but not save changes.
        </p>
      )}

      <fieldset disabled={!canEdit} className="contents">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loan rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SettingsField
                name="dueDate"
                label="Due date"
                type="date"
                defaultValue={
                  loanSettings?.dueDate?.toISOString().split("T")[0]
                }
                errors={errors}
              />
              <SettingsField
                name="depositGraceDays"
                label="Deposit grace days"
                type="number"
                defaultValue={loanSettings?.depositGraceDays ?? 14}
                errors={errors}
              />
              <SettingsField
                name="depositAmount"
                label="Deposit amount (full)"
                type="number"
                defaultValue={loanSettings?.depositAmount ?? 100000}
                errors={errors}
              />
              <SettingsField
                name="depositPartialAmount"
                label="Deposit amount (partial)"
                type="number"
                defaultValue={loanSettings?.depositPartialAmount ?? 50000}
                errors={errors}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SettingsField
                name="bankName"
                maxLength={100}
                label="Bank name"
                defaultValue={loanSettings?.bankName ?? ""}
                errors={errors}
              />
              <SettingsField
                name="bankAccount"
                maxLength={50}
                label="Bank account number"
                defaultValue={loanSettings?.bankAccount ?? ""}
                errors={errors}
              />
              <SettingsField
                name="bankHolder"
                maxLength={100}
                label="Bank account holder"
                defaultValue={loanSettings?.bankHolder ?? ""}
                className="sm:col-span-2"
                errors={errors}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Signatory data (PIHAK PERTAMA)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SettingsField
              name="signatoryName"
              maxLength={100}
              label="Name"
              defaultValue={loanSettings?.signatoryName ?? ""}
              errors={errors}
            />
            <SettingsField
              name="signatoryPhone"
              maxLength={20}
              label="Phone"
              defaultValue={loanSettings?.signatoryPhone ?? ""}
              errors={errors}
            />
            <SettingsField
              name="signatoryLineId"
              maxLength={50}
              label="LINE ID"
              defaultValue={loanSettings?.signatoryLineId ?? ""}
              errors={errors}
            />
            <SettingsField
              name="signatoryKtpNumber"
              maxLength={16}
              label="KTP number"
              defaultValue={loanSettings?.signatoryKtpNumber ?? ""}
              placeholder="16 digit"
              errors={errors}
            />
            <SettingsField
              name="signatoryAddressKtp"
              maxLength={300}
              label="Address (as per KTP)"
              defaultValue={loanSettings?.signatoryAddressKtp ?? ""}
              errors={errors}
            />
            <SettingsField
              name="signatoryAddressDomicile"
              maxLength={300}
              label="Current address"
              defaultValue={loanSettings?.signatoryAddressDomicile ?? ""}
              errors={errors}
            />
            <SettingsField
              name="signatoryFaculty"
              maxLength={60}
              label="Faculty"
              defaultValue={signatoryFacultyMajor.faculty}
              placeholder="e.g. FT"
              errors={errors}
            />
            <SettingsField
              name="signatoryMajor"
              maxLength={60}
              label="Major"
              defaultValue={signatoryFacultyMajor.major}
              placeholder="e.g. Teknik Elektro"
              errors={errors}
            />
            <SettingsField
              name="signatoryYear"
              maxLength={4}
              label="Year"
              defaultValue={loanSettings?.signatoryYear ?? ""}
              errors={errors}
            />
            <SettingsField
              name="signatorySection"
              maxLength={100}
              label="Section/instrument"
              defaultValue={loanSettings?.signatorySection ?? ""}
              errors={errors}
            />
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="signatoryImage">
                Signature image{" "}
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
                independently from Save loan settings.
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
        <div className="slide-up-enter sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-hero-bg px-4 py-3 text-hero-fg shadow-lg">
          <span className="text-sm">
            Unsaved changes in Loan rules, Bank Account or Signatory Data
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
              {isPending ? "Saving..." : "Save loan settings"}
            </Button>
          </div>
        </div>
      ) : (
        <Button type="submit" disabled={isPending} className="self-start">
          {isPending ? "Saving..." : "Save loan settings"}
        </Button>
      )}
      </fieldset>
    </form>
  );
}
