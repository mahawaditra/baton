import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AssignSection } from "./AssignSection";
import { NotifyAndRejectPanel } from "./NotifyAndRejectPanel";
import { DocumentReviewSection } from "./DocumentReviewSection";
import { confirmExtension, confirmHandover, confirmReturn } from "./actions";
import {
  canAssignInstrument,
  canNotifyBorrower,
  getRequestStep,
  LOAN_STEP_LABELS,
} from "@/lib/loan-rules";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { LoanStepper } from "@/components/LoanStepper";
import { SubmitButton } from "@/components/SubmitButton";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await prisma.borrowingRequest.findUniqueOrThrow({
    where: { id },
    include: {
      instrument: true,
    },
  });

  const candidates = await prisma.instrument.findMany({
    where: {
      status: "available",
      condition: { in: ["ok", "need_repair"] },
      isLoanable: true,
      type: { contains: request.instrumentTypeRequested, mode: "insensitive" },
    },
  });

  const latestPeriod = await prisma.loanPeriod.findFirst({
    where: { requestId: request.id },
    orderBy: { sequence: "desc" },
  });

  const documents = latestPeriod
    ? await prisma.document.findMany({
        where: { periodId: latestPeriod.id },
        distinct: ["type"],
        orderBy: { uploadedAt: "desc" },
      })
    : [];

  const addendums = latestPeriod
    ? await prisma.addendum.findMany({
        where: { periodId: latestPeriod.id },
        orderBy: { submittedAt: "asc" },
      })
    : [];

  const canAssign = canAssignInstrument(
    request.status,
    request.instrumentConfirmed,
  );
  const canNotify = canNotifyBorrower(
    request.status,
    request.instrumentConfirmed,
  );

  const isExtension = latestPeriod?.periodType === "extension";

  const step = getRequestStep(request.status, request.instrumentConfirmed);
  const stepLabels = LOAN_STEP_LABELS.map((label, index) =>
    index === 3 && request.status === "returned" ? "Returned" : label,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <RequestStatusBadge status={request.status} variant="pill" />
          <span className="tabular text-xs text-muted-foreground">
            Submitted {request.createdAt.toLocaleDateString("en-GB")}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {request.borrowerName}{" "}
          <span className="tabular text-muted-foreground">
            — {request.ticketId}
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {request.instrumentTypeRequested}
          {request.status === "reviewing" &&
            request.instrumentConfirmed &&
            " · Instrument confirmed — waiting for borrower to complete Stage 2"}
        </p>
      </div>

      {step === "exception" ? (
        <div className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive-soft/40 p-4 text-sm">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
            strokeWidth={1.75}
          />
          <div>
            <div className="font-semibold text-destructive">
              {request.status === "rejected" ? "Request Rejected" : "Overdue"}
            </div>
            {request.status === "rejected" && request.rejectionReason && (
              <div className="mt-0.5 text-foreground-2">
                {request.rejectionReason}
              </div>
            )}
            {request.status === "overdue" && (
              <div className="mt-0.5 text-foreground-2">
                The borrower has not returned the instrument by the due date.
              </div>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent>
            <LoanStepper steps={stepLabels} current={step} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Borrower</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Year</dt>
                  <dd className="mt-0.5 font-medium">
                    {request.borrowerYear}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="mt-0.5 font-medium">
                    {request.borrowerEmail}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="tabular mt-0.5 font-medium">
                    {request.borrowerPhone}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">LINE</dt>
                  <dd className="mt-0.5 font-medium">
                    {request.borrowerLineId}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {canAssign && (
            <Card>
              <CardHeader>
                <CardTitle>Assign Instrument</CardTitle>
              </CardHeader>
              <CardContent>
                <AssignSection
                  requestId={id}
                  currentInstrument={request.instrument}
                  candidates={candidates}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {canAssign ? (
            <NotifyAndRejectPanel requestId={id} canNotify={canNotify} />
          ) : (
            request.instrument && (
              <Card>
                <CardHeader>
                  <CardTitle>Instrument</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/admin/instruments/${request.instrument.id}`}
                    className="text-sm font-medium text-navy underline-offset-4 hover:underline"
                  >
                    {request.instrument.type}
                    {request.instrument.brand &&
                      ` — ${request.instrument.brand}`}
                    {request.instrument.serialNumber &&
                      ` (S/N: ${request.instrument.serialNumber})`}
                  </Link>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>

      {(request.status === "documents_uploaded" ||
        (isExtension && documents.length > 0)) && (
        <DocumentReviewSection
          requestId={id}
          documents={documents}
          isExtension={isExtension}
        />
      )}

      {addendums.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Condition Addendum</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            {addendums.map((a) => (
              <div key={a.id} className="rounded-md border border-border p-4">
                <div className="text-sm font-semibold capitalize">
                  {a.timing} Condition
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Completeness
                      </dt>
                      <dd className="mt-0.5">{a.completeness}</dd>
                    </div>
                    {a.accessoriesCondition && (
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Accessories Condition
                        </dt>
                        <dd className="mt-0.5">{a.accessoriesCondition}</dd>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Body Condition
                      </dt>
                      <dd className="mt-0.5">{a.bodyCondition}</dd>
                    </div>
                    {a.notes && (
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Notes
                        </dt>
                        <dd className="mt-0.5">{a.notes}</dd>
                      </div>
                    )}
                  </div>
                </div>
                {a.driveFileIds.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.driveFileIds.map((fileId, index) => (
                      <a
                        key={fileId}
                        href={`/admin/drive-files/${fileId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {a.driveFileIds.length > 1
                          ? `Photo ${index + 1}`
                          : "View Photo"}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {request.status === "ready_to_pickup" && (
              <form action={confirmHandover.bind(null, id)}>
                <SubmitButton pendingText="Confirming..." className="w-full">
                  Confirm Handover
                </SubmitButton>
              </form>
            )}

            {isExtension && !latestPeriod?.startDate && (
              <form action={confirmExtension.bind(null, id)}>
                <SubmitButton pendingText="Confirming..." className="w-full">
                  Confirm Extension
                </SubmitButton>
              </form>
            )}

            {(request.status === "active" || request.status === "overdue") &&
              addendums.some((a) => a.timing === "final") && (
                <form
                  action={confirmReturn.bind(null, id)}
                  className="flex flex-col gap-3 rounded-md border border-border p-4"
                >
                  <div className="text-sm font-semibold">Confirm Return</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="condition">Condition</Label>
                      <Select name="condition" defaultValue="ok">
                        <SelectTrigger id="condition" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ok">OK</SelectItem>
                          <SelectItem value="need_repair">
                            Need Repair
                          </SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue="available">
                        <SelectTrigger id="status" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="unavailable">
                            Unavailable
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Ignored if Retired/Lost — forced Unavailable.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      defaultValue="Sekre"
                      required
                    />
                  </div>
                  <SubmitButton pendingText="Confirming..." className="self-start">
                    Confirm Return
                  </SubmitButton>
                </form>
              )}
          </CardContent>
        </Card>
      )}

      {isExtension && addendums.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Waiting for borrower to submit the addendum for this extension
          period.
        </p>
      )}
    </div>
  );
}
