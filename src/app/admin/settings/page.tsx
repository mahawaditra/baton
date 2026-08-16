import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { LoanSettingsForm } from "./LoanSettingsForm";
import { AddAdminForm } from "./AddAdminForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSuperAdmin = session?.user.role === "super_admin";

  const admins = isSuperAdmin
    ? await prisma.admin.findMany({ orderBy: { createdAt: "asc" } })
    : [];

  const loanSettings = await prisma.loanSetting.findFirst();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1">Settings</h1>

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
                    className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <div>
                      <span className="font-medium">{admin.name}</span>{" "}
                      <span className="text-muted-foreground">
                        ({admin.email})
                      </span>
                    </div>
                    {admin.role === "super_admin" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-semibold text-[oklch(0.42_0.09_82)]">
                        <ShieldCheck className="h-3 w-3" strokeWidth={2} />
                        Super Admin
                      </span>
                    )}
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
