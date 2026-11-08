"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { SurveyCommentSummary } from "@/lib/survey/survey-report";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, staggerStyle } from "@/lib/utils";

const SEARCH_MIN_COMMENTS = 6;

function CommentEntry({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element || expanded) return;
    const observer = new ResizeObserver(() => {
      setOverflows(element.scrollHeight > element.clientHeight + 1);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [expanded]);

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <p
        ref={textRef}
        className={cn(
          "text-body wrap-anywhere whitespace-pre-wrap text-foreground-2",
          !expanded && "line-clamp-4",
        )}
      >
        {text}
      </p>
      {overflows && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-caption font-medium text-foreground underline-offset-4 hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </li>
  );
}

export function SurveyComments({
  comments,
}: {
  comments: SurveyCommentSummary[];
}) {
  const [query, setQuery] = useState("");
  const total = comments.reduce((sum, c) => sum + c.entries.length, 0);
  const normalizedQuery = query.trim().toLowerCase();

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-h3 font-heading">Comments</h2>
        {total >= SEARCH_MIN_COMMENTS && (
          <div className="relative w-full sm:w-64">
            <Search
              aria-hidden
              strokeWidth={1.75}
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              aria-label="Search comments"
              placeholder="Search comments"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {comments.map((comment, commentIndex) => {
          const entries = normalizedQuery
            ? comment.entries.filter((entry) =>
                entry.toLowerCase().includes(normalizedQuery),
              )
            : comment.entries;
          return (
            <Card
              key={comment.key}
              data-stagger
              className="relative"
              style={staggerStyle(5 + commentIndex)}
            >
              <CardHeader className="grid-cols-[1fr_auto] gap-3">
                <CardTitle className="text-title">{comment.label}</CardTitle>
                <span className="tabular rounded-full bg-muted px-2 py-0.5 text-caption text-foreground-2">
                  {normalizedQuery
                    ? `${entries.length} of ${comment.entries.length}`
                    : comment.entries.length}
                </span>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="scrollbar-subtle h-72 overflow-y-auto pr-3">
                  {entries.length === 0 ? (
                    <EmptyState
                      size="compact"
                      tone={normalizedQuery ? "search" : "neutral"}
                      title={normalizedQuery ? "No matches" : "No comments"}
                      className="absolute inset-0 py-0"
                    />
                  ) : (
                    <ul className="divide-y divide-border">
                      {entries.map((entry, index) => (
                        <CommentEntry key={`${index}-${entry}`} text={entry} />
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
