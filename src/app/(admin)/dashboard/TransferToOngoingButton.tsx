"use client";

import { useState, useTransition } from "react";
import { ArrowRightLeft } from "lucide-react";
import { transferToOngoing } from "./actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toastError } from "@/lib/toast";

export function TransferToOngoingButton({
  transferableCount,
}: {
  transferableCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (transferableCount === 0) return null;

  const noun = transferableCount === 1 ? "loan" : "loans";

  function handleConfirm() {
    startTransition(async () => {
      try {
        await transferToOngoing();
        setOpen(false);
      } catch {
        toastError("Failed to transfer loans. Try again.");
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
        <ArrowRightLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        Transfer
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[480px]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Transfer {transferableCount} active {noun} to Ongoing Loans?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Loan status doesn&apos;t change — the due-date countdown, email
            reminders, and return flow all keep working as normal. This only
            changes how they&apos;re grouped on the dashboard, so the active
            roster stays clean for the new borrower batch.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={pending}>
            {pending
              ? "Transferring..."
              : `Transfer ${transferableCount} ${noun}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
