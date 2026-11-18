import {
  AlertTriangle,
  Check,
  Clock,
  Hourglass,
  Info,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NoticeTone =
  | "borrower"
  | "staff"
  | "success"
  | "danger"
  | "info"
  | "neutral";

const NOTICE_TONES: Record<
  NoticeTone,
  { surface: string; chip: string; mark: string; icon: LucideIcon }
> = {
  borrower: {
    surface: "border-gold/45 bg-gold-soft",
    chip: "bg-gold text-hero-bg",
    mark: "text-gold-soft-foreground",
    icon: PenLine,
  },
  staff: {
    surface: "border-plum/25 bg-plum-soft",
    chip: "bg-plum text-plum-soft",
    mark: "text-plum",
    icon: Hourglass,
  },
  success: {
    surface: "border-success/35 bg-success-soft",
    chip: "bg-success text-success-foreground",
    mark: "text-success-soft-foreground",
    icon: Check,
  },
  danger: {
    surface: "border-destructive/35 bg-destructive-soft",
    chip: "bg-destructive text-destructive-foreground",
    mark: "text-destructive-soft-foreground",
    icon: AlertTriangle,
  },
  info: {
    surface: "border-border bg-card",
    chip: "bg-plum-soft text-plum",
    mark: "text-plum",
    icon: Clock,
  },
  neutral: {
    surface: "border-border bg-muted",
    chip: "bg-card text-muted-foreground",
    mark: "text-muted-foreground",
    icon: Info,
  },
};

type NoticeIconProps = {
  tone: NoticeTone;
  icon?: LucideIcon;
  iconClassName?: string;
};

type NoticeRowProps = NoticeIconProps & {
  title: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
};

export function NoticeRow({
  tone,
  icon,
  iconClassName,
  title,
  children,
  action,
  meta,
  className,
}: NoticeRowProps) {
  const style = NOTICE_TONES[tone];
  const Icon = icon ?? style.icon;
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
          style.chip,
        )}
      >
        <Icon
          aria-hidden
          className={cn("h-4 w-4", iconClassName)}
          strokeWidth={1.75}
        />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-label text-foreground">{title}</div>
        {children && (
          <div className="mt-0.5 text-body text-foreground-2">{children}</div>
        )}
        {meta && (
          <p className="tabular mt-1 text-xs text-muted-foreground sm:hidden">
            {meta}
          </p>
        )}
        {action && <div className="mt-2.5">{action}</div>}
      </div>
      {meta && (
        <span className="tabular hidden shrink-0 pt-0.5 text-xs text-muted-foreground sm:block">
          {meta}
        </span>
      )}
    </div>
  );
}

type NoticeProps = Omit<React.ComponentProps<"div">, "title"> &
  NoticeIconProps &
  (
    | {
        compact: true;
        title?: never;
        action?: never;
        meta?: never;
      }
    | {
        compact?: false;
        title: React.ReactNode;
        action?: React.ReactNode;
        meta?: React.ReactNode;
      }
  );

export function Notice({
  tone,
  icon,
  iconClassName,
  compact,
  title,
  action,
  meta,
  className,
  children,
  ...props
}: NoticeProps) {
  const style = NOTICE_TONES[tone];

  if (compact) {
    const Icon = icon ?? style.icon;
    return (
      <div
        className={cn(
          "flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-sm text-foreground",
          style.surface,
          className,
        )}
        {...props}
      >
        <Icon
          aria-hidden
          className={cn("mt-0.5 h-4 w-4 shrink-0", style.mark, iconClassName)}
          strokeWidth={1.75}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn("rounded-md border px-4 py-3.5", style.surface, className)}
      {...props}
    >
      <NoticeRow
        tone={tone}
        icon={icon}
        iconClassName={iconClassName}
        title={title}
        action={action}
        meta={meta}
      >
        {children}
      </NoticeRow>
    </div>
  );
}
