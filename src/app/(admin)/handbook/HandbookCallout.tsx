import { AlertTriangle } from "lucide-react";

export function HandbookCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md bg-destructive-soft p-3 text-sm text-foreground">
      <AlertTriangle
        className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
        strokeWidth={1.75}
      />
      <p className="font-medium">{children}</p>
    </div>
  );
}
