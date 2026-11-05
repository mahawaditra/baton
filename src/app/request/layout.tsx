import { PublicShell } from "@/components/PublicShell";

export default function RequestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell>{children}</PublicShell>;
}
