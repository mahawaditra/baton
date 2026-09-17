import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TaskCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="gap-2 text-sm text-foreground-2">
        {children}
      </CardContent>
    </Card>
  );
}
