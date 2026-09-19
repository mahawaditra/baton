"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export function LoanableCheckbox({
  blocked,
  checked,
  onCheckedChange,
}: {
  blocked: boolean;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label
      title={
        blocked
          ? 'Not loanable while Condition is "Pensiun" or "Hilang"'
          : undefined
      }
      className={cn(
        "flex h-10 items-center gap-2 text-sm",
        blocked && "cursor-not-allowed text-muted-foreground opacity-60",
      )}
    >
      <Checkbox
        name="isLoanable"
        value="true"
        checked={!blocked && checked}
        onCheckedChange={(next) => onCheckedChange(next)}
        disabled={blocked}
      />
      Loanable
    </label>
  );
}
