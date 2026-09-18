"use client";

import { useState, useTransition } from "react";
import { setSignatoryLineAddFriendUrl } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignatoryLineAddFriendUrlField({
  defaultValue,
  disabled,
}: {
  defaultValue: string;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const [savedValue, setSavedValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isDirty = value !== savedValue;

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await setSignatoryLineAddFriendUrl(value);
        if (result.success) {
          setSavedValue(value);
        } else {
          setError(result.error);
        }
      } catch {
        setError("Couldn't save that. Try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <Input
          aria-label="LINE Add Friend Link"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://line.me/ti/p/..."
          disabled={disabled || pending}
          className="pr-16"
        />
        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={disabled || pending || !isDirty}
          onClick={handleSave}
          className="absolute top-1/2 right-1.5 -translate-y-1/2"
        >
          {pending ? "..." : "Save"}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive" aria-live="polite">
          {error}
        </p>
      )}
      <p className="text-caption text-muted-foreground">
        Generate dari app LINE (Profile → QR code di atas → Copy link).
      </p>
    </div>
  );
}
