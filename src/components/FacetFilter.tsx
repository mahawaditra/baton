"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export function FacetFilter({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "gap-1.5",
        )}
      >
        {label}
        {selected.size > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-micro text-background">
            {selected.size}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted"
            >
              <Checkbox
                checked={selected.has(option)}
                onCheckedChange={() => onToggle(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
