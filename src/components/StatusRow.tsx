import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusRow({
  icon: Icon,
  iconClassName,
  chipClassName,
  title,
  message,
  meta,
  className,
}: {
  icon: LucideIcon;
  iconClassName?: string;
  chipClassName: string;
  title: string;
  message: React.ReactNode;
  meta?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          chipClassName,
        )}
      >
        <Icon className={cn("h-4 w-4", iconClassName)} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-label text-foreground">{title}</div>
        <p className="mt-0.5 text-body text-foreground-2">{message}</p>
        {meta && (
          <p className="tabular mt-1 text-xs text-muted-foreground sm:hidden">
            {meta}
          </p>
        )}
      </div>
      {meta && (
        <span className="tabular hidden shrink-0 pt-0.5 text-xs text-muted-foreground sm:block">
          {meta}
        </span>
      )}
    </div>
  );
}
