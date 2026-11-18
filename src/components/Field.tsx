"use client";

import { useEffect, useId, useRef } from "react";
import { CircleAlert } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const OPTIONAL_LABEL = { id: "opsional", en: "optional" } as const;

export type FieldLanguage = keyof typeof OPTIONAL_LABEL;

export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

export function FieldError({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      id={id}
      className={cn(
        "flex items-start gap-1.5 text-caption text-destructive-soft-foreground",
        className,
      )}
    >
      <CircleAlert
        aria-hidden
        className="mt-px h-3.5 w-3.5 shrink-0"
        strokeWidth={2}
      />
      {children}
    </p>
  );
}

export function OptionalMark({ language = "id" }: { language?: FieldLanguage }) {
  return (
    <span className="font-normal text-muted-foreground">
      ({OPTIONAL_LABEL[language]})
    </span>
  );
}

export function Field({
  label,
  hint,
  error,
  optional = false,
  language = "id",
  id: idProp,
  className,
  children,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  language?: FieldLanguage;
  id?: string;
  className?: string;
  children: (control: FieldControlProps) => React.ReactNode;
}) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {optional && <OptionalMark language={language} />}
      </Label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {error ? (
        <FieldError id={errorId}>{error}</FieldError>
      ) : (
        hint && (
          <p id={hintId} className="text-caption text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function useFocusFirstInvalid<T extends HTMLElement = HTMLFormElement>(
  trigger: unknown,
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!trigger) return;
    ref.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [trigger]);
  return ref;
}
