import { AdminNav } from "./AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminNav />
      <main style={{ flex: 1, padding: "24px" }}>{children}</main>
    </div>
  );
}
