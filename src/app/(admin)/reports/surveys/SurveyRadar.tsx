"use client";

import { useState } from "react";
import { SURVEY_RATING_VALUES } from "@/lib/survey/survey-definition";
import { cn } from "@/lib/utils";
import { CHART_TOOLTIP_CLASS, TooltipValue } from "./chart-tooltip";

export type RadarAxis = {
  key: string;
  label: string;
  value: number | null;
  compareValue: number | null;
};

const WIDTH = 430;
const HEIGHT = 340;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const RADIUS = 118;
const RINGS = SURVEY_RATING_VALUES;
const MAX_RATING = RINGS[RINGS.length - 1];
const LABEL_OFFSET = 14;
const LABEL_LINE_HEIGHT = 18;
const HIT_RADIUS = 16;
const LABEL_LINE_MAX_LENGTH = 12;

function pointAt(index: number, count: number, value: number) {
  const angle = (-90 + (360 * index) / count) * (Math.PI / 180);
  const distance = (value / MAX_RATING) * RADIUS;
  return {
    x: CENTER_X + distance * Math.cos(angle),
    y: CENTER_Y + distance * Math.sin(angle),
    cos: Math.cos(angle),
    sin: Math.sin(angle),
  };
}

function polygonPoints(values: (number | null)[]) {
  return values
    .map((value, index) => {
      if (value === null) return null;
      const { x, y } = pointAt(index, values.length, value);
      return `${x},${y}`;
    })
    .filter((point) => point !== null)
    .join(" ");
}

function labelLines(label: string) {
  const lines: string[] = [];
  for (const word of label.split(" ")) {
    const last = lines[lines.length - 1];
    if (last && `${last} ${word}`.length <= LABEL_LINE_MAX_LENGTH) {
      lines[lines.length - 1] = `${last} ${word}`;
    } else {
      lines.push(word);
    }
  }
  return lines;
}

function AxisLabel({
  label,
  index,
  count,
}: {
  label: string;
  index: number;
  count: number;
}) {
  const { cos, sin } = pointAt(index, count, MAX_RATING);
  const x = CENTER_X + (RADIUS + LABEL_OFFSET) * cos;
  const y = CENTER_Y + (RADIUS + LABEL_OFFSET) * sin;
  const lines = labelLines(label);
  const anchor = cos > 0.2 ? "start" : cos < -0.2 ? "end" : "middle";
  const blockHeight = (lines.length - 1) * LABEL_LINE_HEIGHT;
  const startY =
    sin < -0.5 ? y - blockHeight : sin > 0.5 ? y + 11 : y + 4 - blockHeight / 2;

  return (
    <text
      textAnchor={anchor}
      className="fill-foreground-2 text-[17px] sm:text-[14px]"
    >
      {lines.map((line, lineIndex) => (
        <tspan key={line} x={x} y={startY + lineIndex * LABEL_LINE_HEIGHT}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function LegendKey({ dashed }: { dashed?: boolean }) {
  return (
    <svg aria-hidden width="18" height="4" className="shrink-0">
      <line
        x1="1"
        y1="2"
        x2="17"
        y2="2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={dashed ? "3 4" : undefined}
        className={dashed ? "stroke-chart-compare" : "stroke-plum"}
      />
    </svg>
  );
}

export function SurveyRadar({
  axes,
  seriesLabel,
  compareLabel,
}: {
  axes: RadarAxis[];
  seriesLabel: string;
  compareLabel: string | null;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : axes[activeIndex];
  const values = axes.map((axis) => axis.value);
  const compareValues = axes.map((axis) => axis.compareValue);
  const anchor =
    activeIndex === null
      ? null
      : pointAt(activeIndex, axes.length, values[activeIndex] ?? MAX_RATING);

  const description = axes
    .map(
      (axis) =>
        `${axis.label} ${axis.value === null ? "no ratings" : axis.value.toFixed(1)}`,
    )
    .join(", ");

  return (
    <div className="flex flex-col gap-3">
      {compareLabel && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-foreground-2">
          <span className="inline-flex items-center gap-2">
            <LegendKey />
            {seriesLabel}
          </span>
          <span className="inline-flex items-center gap-2">
            <LegendKey dashed />
            {compareLabel}
          </span>
        </div>
      )}
      <div className="relative mx-auto w-full max-w-md">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="group"
          aria-label={`Average rating out of ${MAX_RATING} by area: ${description}.`}
          className="block w-full overflow-visible"
        >
          {RINGS.map((ring) => (
            <polygon
              key={ring}
              points={polygonPoints(axes.map(() => ring))}
              className="fill-none stroke-border"
              strokeWidth="1"
            />
          ))}
          {axes.map((axis, index) => {
            const { x, y } = pointAt(index, axes.length, MAX_RATING);
            return (
              <line
                key={axis.key}
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={x}
                y2={y}
                className="stroke-border"
                strokeWidth="1"
              />
            );
          })}
          {[1, 3, 5].map((ring) => (
            <text
              key={ring}
              x={CENTER_X + 5}
              y={CENTER_Y - (ring / MAX_RATING) * RADIUS + 11}
              className="tabular fill-muted-foreground text-[13px] sm:text-[10px]"
            >
              {ring}
            </text>
          ))}

          <g
            className="chart-grow"
            style={{ transformOrigin: `${CENTER_X}px ${CENTER_Y}px` }}
          >
            {compareLabel && (
              <polygon
                points={polygonPoints(compareValues)}
                className="fill-none stroke-chart-compare"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeDasharray="3 4"
              />
            )}
            <polygon
              points={polygonPoints(values)}
              className="fill-plum/15 stroke-plum"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {compareLabel &&
              compareValues.map((value, index) => {
                if (value === null) return null;
                const { x, y } = pointAt(index, axes.length, value);
                return (
                  <circle
                    key={axes[index].key}
                    cx={x}
                    cy={y}
                    r="4"
                    strokeWidth="2"
                    className="fill-chart-compare stroke-card"
                  />
                );
              })}
            {values.map((value, index) => {
              if (value === null) return null;
              const { x, y } = pointAt(index, axes.length, value);
              return (
                <circle
                  key={axes[index].key}
                  cx={x}
                  cy={y}
                  r={activeIndex === index ? 6 : 4}
                  strokeWidth="2"
                  className="fill-plum stroke-card"
                />
              );
            })}
          </g>

          {axes.map((axis, index) => (
            <AxisLabel
              key={axis.key}
              label={axis.label}
              index={index}
              count={axes.length}
            />
          ))}

          {axes.map((axis, index) => {
            const { x, y } = pointAt(
              index,
              axes.length,
              axis.value ?? MAX_RATING,
            );
            return (
              <circle
                key={axis.key}
                cx={x}
                cy={y}
                r={HIT_RADIUS}
                tabIndex={0}
                role="img"
                aria-label={`${axis.label}: ${
                  axis.value === null
                    ? "no ratings"
                    : `${axis.value.toFixed(1)} of ${MAX_RATING}`
                }`}
                className="cursor-default fill-transparent outline-none"
                onPointerEnter={() => setActiveIndex(index)}
                onPointerLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
              />
            );
          })}
        </svg>

        {active && anchor && (
          <div
            className={cn(
              CHART_TOOLTIP_CLASS,
              "absolute -translate-x-1/2 -translate-y-full",
            )}
            style={{
              left: `${(anchor.x / WIDTH) * 100}%`,
              top: `calc(${(anchor.y / HEIGHT) * 100}% - 12px)`,
            }}
          >
            <TooltipValue>
              {active.value === null
                ? "No ratings"
                : `${active.value.toFixed(1)} of ${MAX_RATING}`}
            </TooltipValue>
            <div>{active.label}</div>
            {compareLabel && active.compareValue !== null && (
              <div className="tabular mt-1 inline-flex items-center gap-1.5">
                <LegendKey dashed />
                {compareLabel}: {active.compareValue.toFixed(1)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
