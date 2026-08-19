import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

type MetaItem = {
  icon: LucideIcon;
  text: React.ReactNode;
};

export function EntityCard({
  href,
  title,
  titleSuffix,
  subtitle,
  topRight,
  metaLeft,
  metaGrow,
}: {
  href: string;
  title: string;
  titleSuffix?: React.ReactNode;
  subtitle?: React.ReactNode;
  topRight?: React.ReactNode;
  metaLeft?: MetaItem[];
  metaGrow?: MetaItem;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-border bg-surface p-3.5 shadow-sm transition-transform active:translate-y-px"
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="truncate text-base font-semibold text-foreground">
              {title}
            </span>
            {titleSuffix}
          </div>
          {subtitle && (
            <div className="mt-0.5 truncate text-caption text-muted-foreground">
              {subtitle}
            </div>
          )}
        </div>
        {topRight}
      </div>
      <div className="mt-2.5 flex items-center gap-3.5 border-t border-dashed border-border pt-2.5 text-xs text-muted-foreground">
        {metaLeft?.map((m, i) => (
          <span key={i} className="tabular flex shrink-0 items-center gap-1">
            <m.icon className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            {m.text}
          </span>
        ))}
        {metaGrow ? (
          <span className="flex min-w-0 flex-1 items-center gap-1">
            <metaGrow.icon className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{metaGrow.text}</span>
          </span>
        ) : (
          <span className="flex-1" />
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
      </div>
    </Link>
  );
}
