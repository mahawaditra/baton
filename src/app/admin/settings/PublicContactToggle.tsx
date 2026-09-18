"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toastError } from "@/lib/toast";

export function PublicContactToggle({
  id,
  label,
  defaultValue,
  disabled,
  action,
}: {
  id: string;
  label: string;
  defaultValue: boolean;
  disabled?: boolean;
  action: (value: boolean) => Promise<void>;
}) {
  const [checked, setChecked] = useState(defaultValue);
  const [pending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      try {
        await action(next);
      } catch {
        setChecked(!next);
        toastError("Couldn't save that. Try again.");
      }
    });
  }

  return (
    <div className="flex items-start gap-2.5">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={handleChange}
        disabled={pending || disabled}
        className="mt-0.5"
      />
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id} className="font-normal text-foreground-2">
          {label}
        </Label>
        {pending && (
          <span className="text-caption text-muted-foreground">Saving…</span>
        )}
      </div>
    </div>
  );
}
