import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const MOTION =
  "duration-250 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none";

export function CollapseChevron({
  open,
  className,
}: {
  open: boolean;
  className?: string;
}) {
  return (
    <ChevronDown
      aria-hidden
      className={cn(
        "h-4 w-4 shrink-0 transition-transform",
        MOTION,
        !open && "-rotate-90",
        className,
      )}
      strokeWidth={1.75}
    />
  );
}

export function Collapse({
  open,
  id,
  className,
  children,
}: {
  open: boolean;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      inert={!open}
      className={cn(
        "grid transition-[grid-template-rows,opacity]",
        MOTION,
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className,
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
