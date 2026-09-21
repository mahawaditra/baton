import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { REQUESTABLE_INSTRUMENT_TYPES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/SubmitButton";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoanSettingsForm } from "./LoanSettingsForm";
import { InstrumentTypeSlotsPanel } from "./InstrumentTypeSlotsPanel";
import { AddAdminForm } from "./AddAdminForm";
import { HandoverButton } from "./HandoverButton";
import { setAdminActive } from "./actions";
import { RoleBadge } from "./RoleBadge";
import { needsSignatoryUpdate } from "@/lib/handover";
import {
  assignableRoles,
  canEditSettings,
  canSetActive,
  canViewAdminManagement,
} from "@/lib/roles";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const role = session.user.role;
  const canEdit = canEditSettings(role);
  const showAdminManagement = canViewAdminManagement(role);

  const admins = showAdminManagement
    ? await prisma.admin.findMany({ orderBy: { createdAt: "asc" } })
    : [];

  const loanSettings = await prisma.loanSetting.findFirst();
  const staffCount = admins.filter((a) => a.role === "staff").length;

  const instrumentTypeSlots = await prisma.instrumentTypeSlot.findMany();
  const slotByType = new Map(
    instrumentTypeSlots.map((s) => [s.instrumentType, s.maxConcurrentLoans]),
  );
  const instrumentTypeSlotRows = REQUESTABLE_INSTRUMENT_TYPES.map((type) => ({
    type,
    maxConcurrentLoans: slotByType.get(type) ?? 1,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="hidden text-h1 lg:block">Settings</h1>

      {needsSignatoryUpdate(role, session.user.id, loanSettings) && (
        <div className="rounded-md bg-warning-soft px-4 py-3 text-sm text-warning-soft-foreground">
          Contracts print the signatory (Pihak Pertama) data from Loan
          Settings. It hasn&apos;t been saved under your name yet, so it may
          still belong to the previous Ketua. Update it and save before
          borrowers generate new contracts.
        </div>
      )}

      <LoanSettingsForm loanSettings={loanSettings} canEdit={canEdit} />
      <InstrumentTypeSlotsPanel
        rows={instrumentTypeSlotRows}
        canEdit={canEdit}
      />

      {showAdminManagement && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Management</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <AddAdminForm roles={assignableRoles(role)} />

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <div className="text-sm font-semibold">Admin List</div>
              <div className="flex flex-col gap-1.5">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex flex-col gap-2 rounded-md border border-border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <span
                        className={cn(
                          "font-medium",
                          !admin.isActive && "text-muted-foreground",
                        )}
                      >
                        {admin.name}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        ({admin.email})
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <RoleBadge role={admin.role} />
                      {admin.handoverAt && (
                        <span className="inline-flex items-center rounded-full bg-warning-soft px-2 py-0.5 text-micro text-warning-soft-foreground">
                          Handing over
                        </span>
                      )}
                      {!admin.isActive && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-micro text-muted-foreground">
                          Inactive
                        </span>
                      )}
                      {admin.id === session.user.id &&
                        admin.role === "ketua" &&
                        !admin.handoverAt && (
                          <HandoverButton staffCount={staffCount} />
                        )}
                      {canSetActive(session.user, admin) && (
                        <form
                          action={setAdminActive.bind(
                            null,
                            admin.id,
                            !admin.isActive,
                          )}
                        >
                          <SubmitButton
                            variant="outline"
                            size="xs"
                            pendingText="..."
                          >
                            {admin.isActive ? "Deactivate" : "Activate"}
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
