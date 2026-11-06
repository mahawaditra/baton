"use client";

import { confirmAvailable } from "./actions";
import { RejectRequestForm } from "./RejectRequestForm";
import { SubmitButton } from "@/components/SubmitButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NotifyAndRejectPanel({
  requestId,
  canNotify,
}: {
  requestId: string;
  canNotify: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notify Borrower</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground-2">
          {canNotify
            ? "The borrower gets an email to fill in contract details and upload documents before the instrument can be handed over."
            : "Assign an instrument above before notifying the borrower."}
        </p>
        <form action={confirmAvailable.bind(null, requestId)}>
          <SubmitButton
            pendingText="Notifying..."
            size="lg"
            disabled={!canNotify}
            className="w-full"
          >
            Notify Borrower
          </SubmitButton>
        </form>
        <Dialog>
          <DialogTrigger
            render={<Button variant="outline" size="lg" className="w-full" />}
          >
            Reject Request
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Request</DialogTitle>
              <DialogDescription>
                Closes this request. The borrower gets the reason by email and
                on their status page.
              </DialogDescription>
            </DialogHeader>
            <RejectRequestForm requestId={requestId} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
