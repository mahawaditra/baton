"use client";

import { useState } from "react";
import { CancelRequestForm } from "./CancelRequestForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CancelRequestPanel({ requestId }: { requestId: string }) {
  const [showCancel, setShowCancel] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setShowCancel((v) => !v)}
        className="self-start text-sm font-medium text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
      >
        Cancel Request?
      </button>

      {showCancel && (
        <Card>
          <CardHeader>
            <CardTitle>Cancel Request</CardTitle>
          </CardHeader>
          <CardContent>
            <CancelRequestForm requestId={requestId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
