"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Collapse, CollapseChevron } from "@/components/Collapse";
import { Field } from "@/components/Field";
import { Input } from "@/components/ui/input";
import { HoldButton } from "@/components/HoldButton";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toastError } from "@/lib/toast";
import { cn } from "@/lib/utils";

const SCHEME_OPTIONS = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
] as const;

export function SchemePreview({ children }: { children: React.ReactNode }) {
  const [scheme, setScheme] = useState<"light" | "dark">("light");
  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl
        ariaLabel="Preview colour scheme"
        options={SCHEME_OPTIONS}
        value={scheme}
        onChange={setScheme}
        className="w-fit"
      />
      <div
        className={cn(
          "rounded-lg border border-border bg-background p-4 text-foreground sm:p-5",
          scheme,
        )}
      >
        {children}
      </div>
    </div>
  );
}

const VIEW_OPTIONS = [
  { id: "table", label: "Table" },
  { id: "board", label: "Board" },
] as const;

export function SegmentedDemo() {
  const [view, setView] = useState<"table" | "board">("table");
  return (
    <SegmentedControl
      ariaLabel="View"
      options={VIEW_OPTIONS}
      value={view}
      onChange={setView}
      className="w-fit"
    />
  );
}

export function CollapseDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="w-full max-w-sm">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="design-system-collapse-demo"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 py-2 text-micro text-muted-foreground uppercase"
      >
        Strings
        <span className="tabular flex h-[18px] min-w-5 items-center justify-center rounded-full bg-muted px-1.5">
          3
        </span>
        <CollapseChevron open={open} className="ml-auto" />
      </button>
      <Collapse id="design-system-collapse-demo" open={open}>
        <ul className="flex flex-col gap-2 pt-1 pb-2 text-sm">
          {["Violin", "Viola", "Cello"].map((item) => (
            <li
              key={item}
              className="rounded-md border border-border bg-surface px-3 py-2"
            >
              {item}
            </li>
          ))}
        </ul>
      </Collapse>
    </div>
  );
}

export function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        Reject request
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject this request?</AlertDialogTitle>
          <AlertDialogDescription>
            The request closes for good and can&apos;t be reopened. The borrower
            gets your reason by email.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep request</AlertDialogCancel>
          <AlertDialogCancel variant="destructive">
            Reject request
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function HoldButtonDemo() {
  const [done, setDone] = useState(false);
  return (
    <div className="flex flex-col items-start gap-2">
      <HoldButton
        label="Hold to sacrifice"
        holdingLabel="Keep holding…"
        pendingLabel="Sacrificing…"
        pending={false}
        onConfirm={() => setDone(true)}
      />
      <p className="text-caption text-muted-foreground" aria-live="polite">
        {done ? "Confirmed. Nothing actually happened." : "Press and hold."}
      </p>
    </div>
  );
}

export function FieldDemo() {
  return (
    <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
      <Field label="Email" hint="Kode akses status akan dikirim ke email ini.">
        {(control) => (
          <Input {...control} type="email" placeholder="nama@email.com" />
        )}
      </Field>
      <Field label="Nama panggilan" optional>
        {(control) => <Input {...control} placeholder="Kalau ada" />}
      </Field>
      <Field label="Angkatan" error="Angkatan harus 4 digit angka">
        {(control) => <Input {...control} defaultValue="23" />}
      </Field>
    </div>
  );
}

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => toast.success("Loan settings saved.")}
      >
        Success toast
      </Button>
      <Button
        variant="outline"
        onClick={() => toastError("Couldn't assign the instrument. Try again.")}
      >
        Error toast
      </Button>
    </div>
  );
}
