import { Children } from "react";
import { BarlineHeading } from "@/components/BarlineHeading";
import { Reveal } from "@/components/Reveal";
import { cn, staggerStyle } from "@/lib/utils";

export function GroupHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-24 border-t border-border pt-10">
      <Reveal>
        <BarlineHeading className="justify-start">{children}</BarlineHeading>
      </Reveal>
    </div>
  );
}

export function Subsection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <Reveal className="flex flex-col gap-4">
        <div data-reveal-child className="flex flex-col gap-1.5">
          <h3 className="text-h3 text-foreground">{title}</h3>
          <p className="max-w-prose text-body text-foreground-2">
            {description}
          </p>
        </div>
        {Children.map(children, (child, index) => (
          <div data-reveal-child style={staggerStyle(index + 1)}>
            {child}
          </div>
        ))}
      </Reveal>
    </section>
  );
}

export function Specimen({
  label,
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <div
        className={cn(
          "flex min-w-0 flex-wrap items-start gap-3 rounded-lg border border-border bg-surface p-4 sm:p-5",
          className,
        )}
      >
        {children}
      </div>
      {label && (
        <figcaption className="text-caption text-muted-foreground">
          {label}
        </figcaption>
      )}
    </figure>
  );
}

export function Rule({
  children,
  tone = "do",
}: {
  children: React.ReactNode;
  tone?: "do" | "dont";
}) {
  return (
    <li className="flex gap-2 text-body text-foreground-2">
      <span
        className={cn(
          "mt-[3px] shrink-0 text-micro uppercase",
          tone === "do"
            ? "text-success-soft-foreground"
            : "text-destructive-soft-foreground",
        )}
      >
        {tone === "do" ? "Do" : "Don't"}
      </span>
      <span>{children}</span>
    </li>
  );
}
