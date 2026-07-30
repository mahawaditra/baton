import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { addAdmin } from "./actions";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSuperAdmin = session?.user.role === "super_admin";

  const admins = isSuperAdmin
    ? await prisma.admin.findMany({ orderBy: { createdAt: "asc" } })
    : [];

  return (
    <div>
      <h1>Settings</h1>

      <section>
        <h2>Loan Settings</h2>
        <p>(Loan settings form — coming later)</p>
      </section>

      {isSuperAdmin && (
        <section>
          <h2>Admin Management</h2>

          <form action={addAdmin}>
            <input
              name="email"
              type="email"
              placeholder="New admin email"
              required
            />
            <input
              name="name"
              type="text"
              placeholder="New admin name"
              required
            />
            <button type="submit">Add Admin</button>
          </form>

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
