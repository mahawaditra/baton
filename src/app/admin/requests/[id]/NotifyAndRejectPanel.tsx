"use client";

import { useState } from "react";
import { confirmAvailable } from "./actions";
import { RejectRequestForm } from "./RejectRequestForm";
import { SubmitButton } from "@/components/SubmitButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NotifyAndRejectPanel({
  requestId,
  canNotify,
}: {
  requestId: string;
  canNotify: boolean;
}) {
  const [showReject, setShowReject] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Notify Borrower</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {canNotify
              ? "The borrower gets an email to complete Stage 2 — contract details and document upload — before the instrument can be handed over."
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
          <button
            type="button"
            onClick={() => setShowReject((v) => !v)}
            className="self-start text-sm font-medium text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
          >
            Reject Request?
          </button>
        </CardContent>
      </Card>

      {showReject && (
        <Card>
          <CardHeader>
            <CardTitle>Reject Request</CardTitle>
          </CardHeader>
          <CardContent>
            <RejectRequestForm requestId={requestId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
