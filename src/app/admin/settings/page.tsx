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
import { setAdminActive } from "./actions";
import { ShieldCheck } from "lucide-react";
import { getRoleLabel } from "@/lib/labels";
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
                      {admin.role !== "staff" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-micro text-gold-soft-foreground">
                          <ShieldCheck className="h-3 w-3" strokeWidth={2} />
                          {getRoleLabel(admin.role)}
                        </span>
                      )}
                      {!admin.isActive && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-micro text-muted-foreground">
                          Inactive
                        </span>
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
