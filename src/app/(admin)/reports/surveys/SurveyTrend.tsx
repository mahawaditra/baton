"use client";

import { useState } from "react";
import { SURVEY_RATING_VALUES } from "@/lib/survey/survey-definition";
import { cn } from "@/lib/utils";
import {
  formatSurveyPeriod,
  type SurveyYearSummary,
} from "@/lib/survey/survey-report";
import { CHART_TOOLTIP_CLASS, TooltipValue } from "./chart-tooltip";

const WIDTH = 420;
const HEIGHT = 190;
const PLOT = { left: 26, right: 40, top: 14, bottom: 30 };
const TICKS = SURVEY_RATING_VALUES;
const MIN_RATING = TICKS[0];
const MAX_RATING = TICKS[TICKS.length - 1];
const MAX_LABELLED_YEARS = 4;

export function SurveyTrend({ years }: { years: SurveyYearSummary[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const plotWidth = WIDTH - PLOT.left - PLOT.right;
  const plotHeight = HEIGHT - PLOT.top - PLOT.bottom;

  const xAt = (index: number) =>
    PLOT.left + (index / Math.max(1, years.length - 1)) * plotWidth;
  const yAt = (value: number) =>
    PLOT.top +
    (1 - (value - MIN_RATING) / (MAX_RATING - MIN_RATING)) * plotHeight;

  const scored = years
    .map((year, index) => ({ ...year, index }))
    .filter((year) => year.overallAverage !== null);
  const line = scored
    .map((year) => `${xAt(year.index)},${yAt(year.overallAverage ?? 0)}`)
    .join(" ");
  const latest = scored[scored.length - 1];
  const active = activeIndex === null ? null : years[activeIndex];
  const bandWidth = plotWidth / Math.max(1, years.length - 1);

  const description = years
    .map(
      (year) =>
        `${formatSurveyPeriod(year.year)}: ${year.overallAverage === null ? "no ratings" : year.overallAverage.toFixed(1)}`,
    )
    .join(", ");

  return (
    <div className="relative mx-auto w-full max-w-md">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="group"
        aria-label={`Overall average rating out of ${MAX_RATING} by year: ${description}.`}
        className="block w-full"
      >
        {TICKS.map((tick) => (
          <g key={tick}>
            <line
              x1={PLOT.left}
              x2={WIDTH - PLOT.right}
              y1={yAt(tick)}
              y2={yAt(tick)}
              strokeWidth="1"
              className="stroke-border"
            />
            <text
              x={PLOT.left - 8}
              y={yAt(tick) + 4}
              textAnchor="end"
              className="tabular fill-muted-foreground text-[16px] sm:text-[12px]"
            >
              {tick}
            </text>
          </g>
        ))}

        {active && (
          <line
            x1={xAt(activeIndex ?? 0)}
            x2={xAt(activeIndex ?? 0)}
            y1={PLOT.top}
            y2={HEIGHT - PLOT.bottom}
            strokeWidth="1"
            className="stroke-border-strong"
          />
        )}

        <polyline
          points={line}
          pathLength={1}
          fill="none"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="chart-draw stroke-plum"
        />

        {scored.map((year) => (
          <circle
            key={year.year}
            cx={xAt(year.index)}
            cy={yAt(year.overallAverage ?? 0)}
            r={activeIndex === year.index ? 6 : 4}
            strokeWidth="2"
            className="chart-fade-late fill-plum stroke-card"
          />
        ))}

        {latest && (
          <text
            x={xAt(latest.index) + 10}
            y={yAt(latest.overallAverage ?? 0) + 4}
            className="tabular chart-fade-late fill-foreground text-[17px] font-semibold sm:text-[13px]"
          >
            {(latest.overallAverage ?? 0).toFixed(1)}
          </text>
        )}

        {years.map((year, index) => {
          if (
            years.length > MAX_LABELLED_YEARS &&
            (years.length - 1 - index) % 2 !== 0
          ) {
            return null;
          }
          return (
            <text
              key={year.year}
              x={xAt(index)}
              y={HEIGHT - 6}
              textAnchor={
                index === 0
                  ? "start"
                  : index === years.length - 1
                    ? "end"
                    : "middle"
              }
              className="tabular fill-muted-foreground text-[16px] sm:text-[12px]"
            >
              {formatSurveyPeriod(year.year)}
            </text>
          );
        })}

        {years.map((year, index) => (
          <rect
            key={year.year}
            x={xAt(index) - bandWidth / 2}
            y={0}
            width={bandWidth}
            height={HEIGHT}
            tabIndex={0}
            role="img"
            aria-label={`${formatSurveyPeriod(year.year)}: ${
              year.overallAverage === null
                ? "no ratings"
                : `${year.overallAverage.toFixed(1)} of ${MAX_RATING}`
            }, ${year.responseCount} responses`}
            className="cursor-default fill-transparent outline-none"
            onPointerEnter={() => setActiveIndex(index)}
            onPointerLeave={() => setActiveIndex(null)}
            onFocus={() => setActiveIndex(index)}
            onBlur={() => setActiveIndex(null)}
          />
        ))}
      </svg>

      {active && activeIndex !== null && (
        <div
          className={cn(
            CHART_TOOLTIP_CLASS,
            "absolute top-0",
            activeIndex === years.length - 1
              ? "-translate-x-full"
              : activeIndex === 0
                ? ""
                : "-translate-x-1/2",
          )}
          style={{ left: `${(xAt(activeIndex) / WIDTH) * 100}%` }}
        >
          <TooltipValue>
            {active.overallAverage === null
              ? "No ratings"
              : `${active.overallAverage.toFixed(1)} of ${MAX_RATING}`}
          </TooltipValue>
          <div className="tabular">
            {formatSurveyPeriod(active.year)} · {active.responseCount}{" "}
            {active.responseCount === 1 ? "response" : "responses"}
          </div>
        </div>
      )}
    </div>
  );
}
