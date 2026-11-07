import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AssignSection } from "./AssignSection";
import { NotifyAndRejectPanel } from "./NotifyAndRejectPanel";
import { CancelRequestPanel } from "./CancelRequestPanel";
import { DocumentReviewSection } from "./DocumentReviewSection";
import { RequestTicket } from "./RequestTicket";
import {
  confirmExtension,
  confirmHandover,
  confirmReturn,
  revertFromOngoing,
} from "./actions";
import {
  ACTIVE_INSTRUMENT_HOLD_STATUSES,
  canAssignInstrument,
  canCancelRequest,
  canNotifyBorrower,
  confirmedExtensionCount,
  documentTypesNeedingUpload,
  formatNameWithNickname,
  getAdminStatusNote,
  formatSharedLocation,
  hasAvailableSlot,
  resolveMaxConcurrentLoans,
} from "@/lib/loan/loan-rules";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { getAddendumTimingLabel } from "@/lib/labels";
import {
  formatCalendarDate,
  formatJakartaDate,
  formatRelativeDays,
} from "@/lib/format";
import {
  CONDITION_OPTIONS,
  STATUS_OPTIONS,
  getStatusLabel,
} from "@/components/StatusBadge";
import { ExtensionBadge } from "@/components/ExtensionBadge";
import { MusicGlyph } from "@/components/MusicGlyph";
import { SubmitButton } from "@/components/SubmitButton";
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
import { Clock, Hourglass } from "lucide-react";
import { StatusRow } from "@/components/StatusRow";
import { PhotoViewerModal } from "@/components/PhotoViewerModal";

const TICKET_ACTION_CLASS =
  "border-hero-fg/30 bg-transparent text-hero-fg hover:bg-hero-fg/10 hover:text-hero-fg dark:border-hero-fg/30 dark:bg-transparent dark:hover:bg-hero-fg/10";

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

  const canAssign = canAssignInstrument(
    request.status,
    request.instrumentConfirmed,
  );
  const canNotify = canNotifyBorrower(
    request.status,
    request.instrumentConfirmed,
  );
  const canCancel = canCancelRequest(request.status);

  const [
    instrumentCandidates,
    typeSlots,
    currentInstrumentHolders,
    latestPeriod,
    remainingActiveHolders,
  ] = await Promise.all([
    canAssign
      ? prisma.instrument.findMany({
          where: {
            status: { notIn: ["placed", "unavailable"] },
            condition: { in: ["ok", "need_repair"] },
            isLoanable: true,
            type: {
              contains: request.instrumentTypeRequested,
              mode: "insensitive",
            },
          },
          include: {
            borrowingRequests: {
              where: { status: { in: [...ACTIVE_INSTRUMENT_HOLD_STATUSES] } },
              select: {
                borrowerName: true,
                borrowerNickname: true,
                borrowerYear: true,
              },
            },
          },
        })
      : [],
    canAssign ? prisma.instrumentTypeSlot.findMany() : [],
    canAssign && request.instrumentId
      ? prisma.borrowingRequest.findMany({
          where: {
            instrumentId: request.instrumentId,
            status: { in: [...ACTIVE_INSTRUMENT_HOLD_STATUSES] },
          },
          select: {
            borrowerName: true,
            borrowerNickname: true,
            borrowerYear: true,
          },
        })
      : [],
    prisma.loanPeriod.findFirst({
      where: { requestId: request.id },
      orderBy: { sequence: "desc" },
    }),
    request.instrumentId
      ? prisma.borrowingRequest.count({
          where: {
            instrumentId: request.instrumentId,
            id: { not: request.id },
            status: { in: [...ACTIVE_INSTRUMENT_HOLD_STATUSES] },
          },
        })
      : 0,
  ]);

  const [documents, addendums] = latestPeriod
    ? await Promise.all([
        prisma.document.findMany({
          where: { periodId: latestPeriod.id },
          distinct: ["type"],
          orderBy: { uploadedAt: "desc" },
        }),
        prisma.addendum.findMany({
          where: { periodId: latestPeriod.id },
          orderBy: { submittedAt: "asc" },
        }),
      ])
    : [[], []];

  const candidates = instrumentCandidates
    .filter((inst) =>
      hasAvailableSlot(
        inst.borrowingRequests.length,
        resolveMaxConcurrentLoans(inst.type, typeSlots),
      ),
    )
    .map((inst) => ({
      ...inst,
      activeHolders: inst.borrowingRequests.length,
      maxConcurrentLoans: resolveMaxConcurrentLoans(inst.type, typeSlots),
      displayLocation: formatSharedLocation(
        inst.borrowingRequests,
        inst.location,
      ),
    }));

  const currentInstrumentWithSlot = request.instrument
    ? {
        ...request.instrument,
        activeHolders: currentInstrumentHolders.length,
        maxConcurrentLoans: resolveMaxConcurrentLoans(
          request.instrument.type,
          typeSlots,
        ),
        displayLocation: formatSharedLocation(
          currentInstrumentHolders,
          request.instrument.location,
        ),
      }
    : null;

  const isLastHolder = remainingActiveHolders === 0;

  const isExtension = latestPeriod?.periodType === "extension";
  const hasInitialAddendum = addendums.some((a) => a.timing === "initial");
  const statusNote = getAdminStatusNote({
    status: request.status,
    instrumentConfirmed: request.instrumentConfirmed,
    hasInitialAddendum,
    hasFinalAddendum: addendums.some((a) => a.timing === "final"),
    isExtensionPeriod: isExtension,
    hasPendingExtension: isExtension && !latestPeriod?.startDate,
    needsExtensionDocuments:
      isExtension &&
      documentTypesNeedingUpload(["signed_contract"], documents).length > 0,
    canFillExtensionAddendum:
      isExtension &&
      !hasInitialAddendum &&
      documents.some(
        (d) => d.type === "signed_contract" && d.reviewStatus === "approved",
      ),
  });
  const showOngoing =
    Boolean(request.carriedOverAt) &&
    (request.status === "active" || request.status === "overdue");
  const statusNoteMeta =
    statusNote?.kind === "info" && latestPeriod?.dueDate
      ? `Due ${formatCalendarDate(latestPeriod.dueDate, "en-GB")}`
      : `Last update ${formatRelativeDays(request.updatedAt).toLowerCase()}`;

  return (
    <div className="flex flex-col gap-6">
      <RequestTicket
        badges={
          <>
            <RequestStatusBadge status={request.status} variant="pill" />
            <ExtensionBadge count={confirmedExtensionCount(latestPeriod)} />
            {showOngoing && request.carriedOverAt && (
              <span className="tabular inline-flex items-center gap-1.5 rounded-full border border-hero-fg/25 px-2.5 py-0.5 text-micro uppercase text-hero-fg/80">
                <MusicGlyph glyph="fermata" className="text-[0.875rem]" />
                Ongoing since {formatJakartaDate(request.carriedOverAt)}
              </span>
            )}
            <span className="tabular text-xs text-hero-fg/70">
              Submitted {formatJakartaDate(request.createdAt)}
            </span>
          </>
        }
        actions={
          (showOngoing || canCancel) && (
            <>
              {showOngoing && (
                <form action={revertFromOngoing.bind(null, id)}>
                  <SubmitButton
                    pendingText="Moving..."
                    variant="outline"
                    size="sm"
                    className={TICKET_ACTION_CLASS}
                  >
                    Move back to active roster
                  </SubmitButton>
                </form>
              )}
              {canCancel && (
                <CancelRequestPanel
                  requestId={id}
                  triggerClassName={TICKET_ACTION_CLASS}
                />
              )}
            </>
          )
        }
        title={formatNameWithNickname(
          request.borrowerName,
          request.borrowerNickname,
        )}
        ticketId={request.ticketId}
        subtitle={
          !canAssign && request.instrument ? (
            <Link
              href={`/instruments/${request.instrument.id}`}
              className="font-medium text-hero-fg underline-offset-4 hover:underline"
            >
              {request.instrument.type}
              {request.instrument.brand && ` — ${request.instrument.brand}`}
              {request.instrument.serialNumber &&
                ` (S/N: ${request.instrument.serialNumber})`}
            </Link>
          ) : (
            request.instrumentTypeRequested
          )
        }
        fields={[
          { label: "Year", value: request.borrowerYear },
          { label: "Email", value: request.borrowerEmail },
          { label: "Phone", value: request.borrowerPhone },
          { label: "LINE", value: request.borrowerLineId },
        ]}
        status={request.status}
        instrumentConfirmed={request.instrumentConfirmed}
        rejectionReason={request.rejectionReason}
        cancellationReason={request.cancellationReason}
      />

      {canAssign ? (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Assign Instrument</CardTitle>
            </CardHeader>
            <CardContent>
              <AssignSection
                requestId={id}
                currentInstrument={currentInstrumentWithSlot}
                candidates={candidates}
              />
            </CardContent>
          </Card>
          <NotifyAndRejectPanel requestId={id} canNotify={canNotify} />
        </div>
      ) : (
        statusNote && (
          <StatusRow
            icon={statusNote.kind === "waiting" ? Hourglass : Clock}
            iconClassName={
              statusNote.kind === "waiting" ? "hourglass-flip" : undefined
            }
            chipClassName={
              statusNote.kind === "waiting"
                ? "bg-muted text-muted-foreground"
                : "bg-plum-soft text-plum"
            }
            title={statusNote.title}
            message={statusNote.message}
            meta={statusNoteMeta}
            className="rounded-md border border-border bg-card px-5 py-4"
          />
        )
      )}

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
                <div className="text-sm font-semibold">
                  {getAddendumTimingLabel(a.timing)}
                </div>
                <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
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
                        <dt className="text-xs text-muted-foreground">Notes</dt>
                        <dd className="mt-0.5">{a.notes}</dd>
                      </div>
                    )}
                  </div>
                </div>
                {a.driveFileIds.length > 0 && (
                  <div className="mt-3">
                    <PhotoViewerModal
                      fileIds={a.driveFileIds}
                      title={`${a.timing === "initial" ? "Initial" : "Final"} condition photos`}
                    />
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
                  {isLastHolder ? (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="condition">Condition</Label>
                          <Select
                            name="condition"
                            items={CONDITION_OPTIONS}
                            defaultValue="ok"
                          >
                            <SelectTrigger id="condition" className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CONDITION_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            name="status"
                            items={STATUS_OPTIONS}
                            defaultValue="available"
                          >
                            <SelectTrigger id="status" className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">
                                {getStatusLabel("available")}
                              </SelectItem>
                              <SelectItem value="unavailable">
                                {getStatusLabel("unavailable")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-foreground-2">
                            Ignored if Condition is &quot;Pensiun&quot; or
                            &quot;Hilang&quot; — forced to &quot;Nonaktif&quot;.
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
                    </>
                  ) : (
                    <p className="text-xs text-foreground-2">
                      Instrumen ini masih dipegang {remainingActiveHolders}{" "}
                      peminjam lain — kondisi/status/lokasi instrumen gak
                      diminta di sini, cuma nutup pengembalian{" "}
                      {formatNameWithNickname(request.borrowerName, request.borrowerNickname)}.
                    </p>
                  )}
                  <SubmitButton
                    pendingText="Confirming..."
                    className="self-start"
                  >
                    Confirm Return
                  </SubmitButton>
                </form>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
