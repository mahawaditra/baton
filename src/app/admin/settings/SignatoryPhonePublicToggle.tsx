"use client";

import { useState, useTransition } from "react";
import { setSignatoryPhonePublic } from "./actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toastError } from "@/lib/toast";

export function SignatoryPhonePublicToggle({
  defaultValue,
}: {
  defaultValue: boolean;
}) {
  const [checked, setChecked] = useState(defaultValue);
  const [pending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      try {
        await setSignatoryPhonePublic(next);
      } catch {
        setChecked(!next);
        toastError("Couldn't save that. Try again.");
      }
    });
  }

  return (
    <div className="flex items-start gap-2.5">
      <Checkbox
        id="signatoryPhonePublic"
        checked={checked}
        onCheckedChange={handleChange}
        disabled={pending}
        className="mt-0.5"
      />
      <div className="flex flex-col gap-0.5">
        <Label
          htmlFor="signatoryPhonePublic"
          className="font-normal text-foreground-2"
        >
          Show this phone number on the public landing page as a WhatsApp
          contact button in the FAQ.
        </Label>
        <span className="text-caption text-muted-foreground">
          {pending
            ? "Saving…"
            : "Applies immediately — independent of the Save button below."}
        </span>
      </div>
    </div>
  );
}
