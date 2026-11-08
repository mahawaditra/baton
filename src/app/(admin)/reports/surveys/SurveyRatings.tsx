"use client";

import { useState } from "react";
import { SURVEY_RATING_SCALE } from "@/lib/survey/survey-definition";
import type { SurveyQuestionSummary } from "@/lib/survey/survey-report";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, staggerStyle } from "@/lib/utils";
import { CHART_TOOLTIP_CLASS, TooltipValue } from "./chart-tooltip";

const RATING_FILL: Record<number, string> = {
  1: "bg-rating-1 text-rating-1-fg",
  2: "bg-rating-2 text-rating-2-fg",
  3: "bg-rating-3 text-rating-3-fg",
  4: "bg-rating-4 text-rating-4-fg",
  5: "bg-rating-5 text-rating-5-fg",
};

const INLINE_LABEL_MIN_SHARE = 0.14;

function percent(share: number) {
  return `${Math.round(share * 100)}%`;
}

function formatAverage(average: number | null) {
  return average === null ? "–" : average.toFixed(1);
}

function SegmentedBar({ question }: { question: SurveyQuestionSummary }) {
  const present = question.counts.filter(({ count }) => count > 0);
  if (present.length === 0) {
    return <div className="h-7 rounded bg-muted" />;
  }
  return (
    <div className="flex h-7 gap-0.5">
      {present.map((rating, index) => {
        const share = rating.count / question.answered;
        const isLastHalf = index >= present.length / 2;
        return (
          <div
            key={rating.value}
            tabIndex={0}
            role="img"
            aria-label={`${rating.label}: ${rating.count}, ${percent(share)}`}
            style={{ flexGrow: rating.count, flexBasis: 0 }}
            className={cn(
              "group/segment relative flex min-w-0 items-center rounded outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring",
              RATING_FILL[rating.value],
            )}
          >
            {share >= INLINE_LABEL_MIN_SHARE && (
              <span className="tabular px-1.5 text-caption leading-none">
                {percent(share)}
              </span>
            )}
            <div
              className={cn(
                CHART_TOOLTIP_CLASS,
                "invisible absolute bottom-full mb-1.5 group-hover/segment:visible group-focus-visible/segment:visible",
                isLastHalf ? "right-0" : "left-0",
              )}
            >
              <TooltipValue>
                {rating.count} · {percent(share)}
              </TooltipValue>
              <div>
                {rating.value}: {rating.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-foreground-2">
      {SURVEY_RATING_SCALE.map((option) => (
        <li key={option.value} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn("h-3 w-3 rounded-sm", RATING_FILL[option.value])}
          />
          <span className="tabular">{option.value}</span> {option.label}
        </li>
      ))}
    </ul>
  );
}

function RatingRow({
  question,
  index,
}: {
  question: SurveyQuestionSummary;
  index: number;
}) {
  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <div className="text-label text-foreground">
            {question.shortLabel}
          </div>
          <div className="text-caption text-muted-foreground">
            {question.label}
          </div>
        </div>
        <div className="tabular shrink-0 text-label font-semibold text-foreground">
          {formatAverage(question.average)}
        </div>
      </div>
      <div className="chart-wipe" style={staggerStyle(index)}>
        <SegmentedBar question={question} />
      </div>
    </li>
  );
}

function RatingsTable({ questions }: { questions: SurveyQuestionSummary[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-muted text-micro text-muted-foreground uppercase">
            <th scope="col" className="h-10 px-2 font-semibold sm:px-3">
              Area
            </th>
            {SURVEY_RATING_SCALE.map((option) => (
              <th
                key={option.value}
                scope="col"
                title={option.label}
                className="tabular h-10 px-1.5 text-right font-semibold sm:px-2"
              >
                {option.value}
              </th>
            ))}
            <th
              scope="col"
              className="h-10 px-2 text-right font-semibold sm:px-3"
            >
              Avg
            </th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question) => (
            <tr key={question.key} className="border-b border-border">
              <th scope="row" className="px-2 py-2.5 font-medium sm:px-3">
                {question.shortLabel}
              </th>
              {question.counts.map((rating) => (
                <td
                  key={rating.value}
                  className="tabular px-1.5 py-2.5 text-right text-foreground-2 sm:px-2"
                >
                  {rating.count}
                </td>
              ))}
              <td className="tabular px-2 py-2.5 text-right font-semibold sm:px-3">
                {formatAverage(question.average)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SurveyRatings({
  questions,
}: {
  questions: SurveyQuestionSummary[];
}) {
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <Card data-stagger style={staggerStyle(4)}>
      <CardHeader className="grid-cols-[1fr_auto] items-center gap-3">
        <CardTitle>How people rated each area</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setView(view === "chart" ? "table" : "chart")}
        >
          {view === "chart" ? "Show as table" : "Show as chart"}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {view === "chart" ? (
          <>
            <Legend />
            <ul className="flex flex-col gap-5">
              {questions.map((question, index) => (
                <RatingRow
                  key={question.key}
                  question={question}
                  index={index}
                />
              ))}
            </ul>
          </>
        ) : (
          <div data-stagger>
            <RatingsTable questions={questions} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
