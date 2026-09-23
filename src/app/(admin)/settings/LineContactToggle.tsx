"use client";

import { useState, useTransition } from "react";
import { setSignatoryLineAddFriendPublic } from "./actions";
import { SignatoryLineAddFriendUrlField } from "./SignatoryLineAddFriendUrlField";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toastError } from "@/lib/toast";

export function LineContactToggle({
  defaultChecked,
  defaultUrl,
  disabled,
}: {
  defaultChecked: boolean;
  defaultUrl: string;
  disabled?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const [pending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      try {
        await setSignatoryLineAddFriendPublic(next);
      } catch {
        setChecked(!next);
        toastError("Couldn't save that. Try again.");
      }
    });
  }

  return (
    <div className="flex flex-1 items-start gap-2.5">
      <Checkbox
        id="signatoryLineAddFriendPublic"
        checked={checked}
        onCheckedChange={handleChange}
        disabled={pending || disabled}
        className="mt-0.5"
      />
      <div className="flex flex-1 flex-col gap-1">
        {checked ? (
          <SignatoryLineAddFriendUrlField
            defaultValue={defaultUrl}
            disabled={disabled}
          />
        ) : (
          <Label
            htmlFor="signatoryLineAddFriendPublic"
            className="font-normal text-foreground-2"
          >
            Enable LINE
          </Label>
        )}
        {pending && (
          <span className="text-caption text-muted-foreground">Saving…</span>
        )}
      </div>
    </div>
  );
}
