import { Mail, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ActionConsequence({
  icon: Icon = Mail,
  className,
  children,
}: {
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "flex items-start gap-1.5 text-caption text-muted-foreground",
        className,
      )}
    >
      <Icon
        aria-hidden
        className="mt-0.5 h-3.5 w-3.5 shrink-0"
        strokeWidth={1.75}
      />
      {children}
    </p>
  );
}
