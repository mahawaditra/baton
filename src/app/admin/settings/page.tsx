import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { LoanSettingsForm } from "./LoanSettingsForm";
import { AddAdminForm } from "./AddAdminForm";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSuperAdmin = session?.user.role === "super_admin";

  const admins = isSuperAdmin
    ? await prisma.admin.findMany({ orderBy: { createdAt: "asc" } })
    : [];

  const loanSettings = await prisma.loanSetting.findFirst();

  return (
    <div>
      <h1>Settings</h1>

      <section>
        <h2>Loan Settings</h2>
        <LoanSettingsForm loanSettings={loanSettings} />
      </section>

      {isSuperAdmin && (
        <section>
          <h2>Admin Management</h2>
          <AddAdminForm />
          <h3>Admin List</h3>
          <ul>
            {admins.map((admin) => (
              <li key={admin.id}>
                {admin.name} ({admin.email}) — {admin.role}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
