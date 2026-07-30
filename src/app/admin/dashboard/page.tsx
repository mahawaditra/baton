import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div>
      <h1>Dashboard Admin BATON</h1>
      <p>Login sebagai: {session?.user.email}</p>
    </div>
  );
}
