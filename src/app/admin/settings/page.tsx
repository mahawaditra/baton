import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { LoanSettingsForm } from "./LoanSettingsForm";
import { AddAdminForm } from "./AddAdminForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { setAdminActive } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { cn } from "@/lib/utils";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSuperAdmin = session?.user.role === "super_admin";

  const admins = isSuperAdmin
    ? await prisma.admin.findMany({ orderBy: { createdAt: "asc" } })
    : [];

  const loanSettings = await prisma.loanSetting.findFirst();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="hidden text-h1 lg:block">Settings</h1>

      <LoanSettingsForm loanSettings={loanSettings} />

      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Management</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <AddAdminForm />

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
                      {admin.role === "super_admin" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-micro text-gold-soft-foreground">
                          <ShieldCheck className="h-3 w-3" strokeWidth={2} />
                          Super Admin
                        </span>
                      )}
                      {!admin.isActive && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-micro text-muted-foreground">
                          Inactive
                        </span>
                      )}
                      {admin.id !== session?.user.id && (
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
