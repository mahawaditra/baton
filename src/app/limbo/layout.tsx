export default function LimboLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-force-dark
      className="dark min-h-screen bg-background text-foreground"
    >
      {children}
    </div>
  );
}
