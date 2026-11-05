import { PublicShell } from "@/components/PublicShell";

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell>{children}</PublicShell>;
}
