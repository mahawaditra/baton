"use client";

import { CancelRequestForm } from "./CancelRequestForm";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function CancelRequestPanel({
  requestId,
  triggerClassName,
}: {
  requestId: string;
  triggerClassName?: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm" className={triggerClassName} />
        }
      >
        Cancel request
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this request?</AlertDialogTitle>
          <AlertDialogDescription>
            The request stops for good and can&apos;t be reopened. The borrower
            gets your reason by email and on their status page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <CancelRequestForm requestId={requestId} />
      </AlertDialogContent>
    </AlertDialog>
  );
}
