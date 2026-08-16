"use client";

import { useState } from "react";
import { Check, Eye, FileText, X } from "lucide-react";
import type { Document } from "@/generated/prisma/client";
import { submitDocumentReview } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function formatDocType(type: string) {
  return type
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

const STATUS_STYLE: Record<string, string> = {
  approved: "bg-success-soft text-[oklch(0.4_0.07_148)]",
  pending: "bg-gold-soft text-[oklch(0.42_0.09_82)]",
  rejected: "bg-destructive-soft text-destructive",
};

export function DocumentReviewSection({
  requestId,
  documents,
  isExtension,
}: {
  requestId: string;
  documents: Document[];
  isExtension: boolean;
}) {
  const pendingDocuments = documents.filter((d) => d.reviewStatus === "pending");

  const [decisions, setDecisions] = useState<
    Record<string, "approved" | "rejected" | null>
  >(() => Object.fromEntries(pendingDocuments.map((d) => [d.id, null])));

  const liveApprovedCount = documents.filter((d) =>
    d.reviewStatus === "pending"
      ? decisions[d.id] === "approved"
      : d.reviewStatus === "approved",
  ).length;
  const anyRejected = Object.values(decisions).includes("rejected");
  const allDecided = pendingDocuments.every((d) => decisions[d.id] !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Documents</CardTitle>
      </CardHeader>
      <CardContent className="gap-4">
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gold transition-[width]"
              style={{
                width: `${(liveApprovedCount / Math.max(documents.length, 1)) * 100}%`,
              }}
            />
          </div>
          <span className="tabular shrink-0 text-xs font-semibold text-muted-foreground">
            {liveApprovedCount} / {documents.length} approved
          </span>
        </div>

        <form
          action={submitDocumentReview.bind(null, requestId)}
          className="flex flex-col gap-3"
        >
          {documents.map((doc) => {
            const style = STATUS_STYLE[doc.reviewStatus] ?? STATUS_STYLE.pending;
            return (
              <div
                key={doc.id}
                className="overflow-hidden rounded-md border border-border"
              >
                <div className="flex items-center gap-4 p-4">
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-md",
                      style,
                    )}
                  >
                    <FileText className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">
                      {formatDocType(doc.type)}
                    </div>
                    <div className="tabular mt-0.5 text-xs text-muted-foreground">
                      {doc.uploadedAt.toLocaleDateString("en-GB")}
                    </div>
                  </div>
                  <a
                    href={`/admin/documents/${doc.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                    View
                  </a>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase",
                      style,
                    )}
                  >
                    {doc.reviewStatus}
                  </span>
                </div>

                {doc.reviewStatus === "pending" ? (
                  <div className="flex flex-wrap items-start gap-3 border-t border-border bg-muted/40 p-4">
                    <input
                      type="radio"
                      id={`approve_${doc.id}`}
                      name={`decision_${doc.id}`}
                      value="approved"
                      onChange={() =>
                        setDecisions((prev) => ({ ...prev, [doc.id]: "approved" }))
                      }
                      className="peer/approve sr-only"
                    />
                    <label
                      htmlFor={`approve_${doc.id}`}
                      className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded border border-border px-3 text-xs font-medium text-muted-foreground peer-checked/approve:border-success peer-checked/approve:bg-success-soft peer-checked/approve:text-[oklch(0.4_0.07_148)]"
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Approve
                    </label>

                    <input
                      type="radio"
                      id={`reject_${doc.id}`}
                      name={`decision_${doc.id}`}
                      value="rejected"
                      onChange={() =>
                        setDecisions((prev) => ({ ...prev, [doc.id]: "rejected" }))
                      }
                      className="peer/reject sr-only"
                    />
                    <label
                      htmlFor={`reject_${doc.id}`}
                      className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded border border-border px-3 text-xs font-medium text-muted-foreground peer-checked/reject:border-destructive peer-checked/reject:bg-destructive-soft peer-checked/reject:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Reject
                    </label>

                    <div className="hidden w-full flex-col gap-1.5 peer-checked/reject:flex">
                      <Label htmlFor={`notes_${doc.id}`}>
                        Reason for rejection
                      </Label>
                      <Textarea
                        id={`notes_${doc.id}`}
                        name={`notes_${doc.id}`}
                        placeholder="Reason for rejection"
                      />
                    </div>
                  </div>
                ) : (
                  doc.reviewerNotes && (
                    <div className="border-t border-border bg-muted/40 p-4 text-sm text-foreground-2">
                      Note: {doc.reviewerNotes}
                    </div>
                  )
                )}
              </div>
            );
          })}

          {pendingDocuments.length > 0 && (
            <>
              <SubmitButton
                pendingText={
                  anyRejected
                    ? "Notifying..."
                    : isExtension
                      ? "Submitting..."
                      : "Confirming..."
                }
                disabled={!allDecided}
                className="w-full"
              >
                {anyRejected
                  ? "Notify for Reupload"
                  : isExtension
                    ? "Submit Review"
                    : "Confirm Documents & Notify Ready for Pickup"}
              </SubmitButton>
              {!allDecided && (
                <p className="text-center text-xs text-muted-foreground">
                  Approve or reject every document above to continue.
                </p>
              )}
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
