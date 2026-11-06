"use client";

import { CancelRequestForm } from "./CancelRequestForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CancelRequestPanel({
  requestId,
  triggerClassName,
}: {
  requestId: string;
  triggerClassName?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className={triggerClassName} />
        }
      >
        Cancel Request
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Request</DialogTitle>
          <DialogDescription>
            Stops this request. The borrower sees the reason on their status
            page.
          </DialogDescription>
        </DialogHeader>
        <CancelRequestForm requestId={requestId} />
      </DialogContent>
    </Dialog>
  );
}
