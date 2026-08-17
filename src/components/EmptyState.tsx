import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONE_STYLE: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  search: "bg-gold-soft text-gold-soft-foreground",
  success: "bg-success-soft text-success-soft-foreground",
  error: "bg-destructive-soft text-[oklch(0.5_0.14_35)]",
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "neutral",
  size = "default",
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "neutral" | "search" | "success" | "error";
  size?: "default" | "compact";
  className?: string;
}) {
  const compact = size === "compact";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-6" : "py-12",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full",
          compact ? "mb-3 h-12 w-12" : "mb-5 h-[88px] w-[88px]",
          TONE_STYLE[tone],
        )}
      >
        {tone === "neutral" && !compact && (
          <span className="absolute -inset-1.5 rounded-full border-2 border-dashed border-border-strong" />
        )}
        <Icon className={compact ? "h-5 w-5" : "h-9 w-9"} strokeWidth={1.5} />
      </div>
      <h3 className={compact ? "text-sm font-semibold" : "text-h3"}>{title}</h3>
      {description && (
        <p
          className={cn(
            "max-w-xs text-muted-foreground",
            compact ? "mt-1 text-xs" : "mt-2 text-sm",
          )}
        >
          {description}
        </p>
      )}
      {action && <div className={compact ? "mt-3" : "mt-5"}>{action}</div>}
    </div>
  );
}
