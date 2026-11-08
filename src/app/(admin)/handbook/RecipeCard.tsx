import Link from "next/link";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, staggerStyle } from "@/lib/utils";

export function RecipeCard({
  step,
  title,
  href,
  hrefLabel,
  children,
}: {
  step: number;
  title: string;
  href?: string;
  hrefLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <Card data-stagger style={staggerStyle(step - 1)}>
      <CardContent className="flex flex-col gap-3 text-sm text-foreground-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-caption font-semibold text-foreground">
            {step}
          </span>
          <h2 className="min-w-0 flex-1 basis-[calc(100%-2.25rem)] font-heading text-title text-foreground sm:basis-0">
            {title}
          </h2>
          {href && hrefLabel && (
            <Link
              href={href}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "shrink-0 max-sm:ml-9",
              )}
            >
              {hrefLabel}
            </Link>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function RecipeRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-2">
      <div className="pt-0.5 text-caption text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}

export function RecipeSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="flex list-decimal flex-col gap-1 pl-5">
      {steps.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  );
}

export function RecipeNote({ children }: { children: React.ReactNode }) {
  return <p className="rounded-md bg-muted p-3">{children}</p>;
}

export function DocumentChecklist({
  items,
}: {
  items: { title: string; checks: string[] }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {items.map(({ title, checks }) => (
        <div key={title} className="rounded-md bg-muted p-3">
          <div className="text-label text-foreground">{title}</div>
          <ul className="mt-1.5 flex flex-col gap-1">
            {checks.map((check) => (
              <li key={check} className="flex items-start gap-1.5">
                <Check
                  aria-hidden
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success"
                  strokeWidth={2}
                />
                {check}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
