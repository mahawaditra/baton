"use client";

import { confirmAvailable } from "./actions";
import { RejectRequestForm } from "./RejectRequestForm";
import { SubmitButton } from "@/components/SubmitButton";
import { ActionConsequence } from "@/components/ActionConsequence";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
        <CardTitle>Notify borrower</CardTitle>
      </CardHeader>
      <CardContent>
        {!canNotify && (
          <p className="text-sm text-foreground-2">
            Assign an instrument above before notifying the borrower.
          </p>
        )}
        <form
          action={confirmAvailable.bind(null, requestId)}
          className="flex flex-col gap-2"
        >
          <SubmitButton
            pendingText="Notifying..."
            size="lg"
            disabled={!canNotify}
            className="w-full"
          >
            Notify borrower
          </SubmitButton>
          <ActionConsequence>
            Emails the borrower to fill in contract details and upload
            documents.
          </ActionConsequence>
        </form>
        <AlertDialog>
          <AlertDialogTrigger
            render={<Button variant="outline" size="lg" className="w-full" />}
          >
            Reject request
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject this request?</AlertDialogTitle>
              <AlertDialogDescription>
                The request closes for good and can&apos;t be reopened. The
                borrower gets your reason by email and on their status page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <RejectRequestForm requestId={requestId} />
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
