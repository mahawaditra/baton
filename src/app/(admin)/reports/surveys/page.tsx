import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/require-admin";
import { SURVEY_FORM_LABELS } from "@/lib/labels";
import {
  SURVEY_PAGE_ORDER,
  isSurveyForm,
} from "@/lib/survey/survey-definition";
import {
  areaQuestions,
  formatSurveyPeriod,
  lowestRatedArea,
  overallQuestion,
  satisfiedShare,
  summarizeSurvey,
  summarizeYears,
} from "@/lib/survey/survey-report";
import { EmptyState } from "@/components/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, staggerStyle } from "@/lib/utils";
import { SurveyComments } from "./SurveyComments";
import { SurveyFilters } from "./SurveyFilters";
import { SurveyRadar } from "./SurveyRadar";
import { SurveyRatings } from "./SurveyRatings";
import { SurveyTrend } from "./SurveyTrend";

const ALL_TIME_LABEL = "All-time";
const MIN_TREND_YEARS = 2;

function StatTile({
  label,
  value,
  note,
  index,
}: {
  label: string;
  value: string;
  note?: string;
  index: number;
}) {
  return (
    <Card size="sm" data-stagger style={staggerStyle(index)}>
      <CardContent className="flex flex-col gap-1">
        <div className="text-caption text-foreground-2">{label}</div>
        <div className="font-heading text-h2 text-foreground">{value}</div>
        {note && (
          <div className="text-caption text-muted-foreground">{note}</div>
        )}
      </CardContent>
    </Card>
  );
}

function formatDelta(current: number, previous: number, year: number) {
  const delta = current - previous;
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "±";
  return `${sign}${Math.abs(delta).toFixed(1)} vs ${formatSurveyPeriod(year)}`;
}

export default async function SurveyResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ form?: string; year?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) notFound();

  const params = await searchParams;
  const form =
    params.form && isSurveyForm(params.form)
      ? params.form
      : SURVEY_PAGE_ORDER[0];

  const responses = await prisma.surveyResponse.findMany({
    where: { form },
    select: { year: true, ratings: true, comments: true },
  });

  const years = [...new Set(responses.map(({ year }) => year))].sort(
    (a, b) => b - a,
  );
  const requestedYear = Number(params.year);
  const selectedYear = years.includes(requestedYear) ? requestedYear : null;
  const periodLabel =
    selectedYear === null ? ALL_TIME_LABEL : formatSurveyPeriod(selectedYear);

  const selected =
    selectedYear === null
      ? responses
      : responses.filter(({ year }) => year === selectedYear);

  const summary = summarizeSurvey(form, selected);
  const overall = overallQuestion(summary);
  const lowest = lowestRatedArea(summary);
  const share = overall ? satisfiedShare(overall) : null;

  const previousYear =
    selectedYear === null
      ? null
      : (years.find((year) => year < selectedYear) ?? null);
  const previousSummary =
    previousYear === null
      ? null
      : summarizeSurvey(
          form,
          responses.filter(({ year }) => year === previousYear),
        );
  const previousOverall = previousSummary
    ? overallQuestion(previousSummary)
    : undefined;

  const trend = selectedYear === null ? summarizeYears(form, responses) : [];

  const radarAxes = areaQuestions(summary).map((question) => ({
    key: question.key,
    label: question.shortLabel,
    value: question.average,
    compareValue:
      previousSummary?.questions.find(({ key }) => key === question.key)
        ?.average ?? null,
  }));

  const rankedAreas = [...areaQuestions(summary)].sort(
    (a, b) => (b.average ?? 0) - (a.average ?? 0),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="hidden text-h1 lg:block">Surveys</h1>
        <Link
          href="/reports"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to Reports
        </Link>
      </div>

      <SurveyFilters
        forms={SURVEY_PAGE_ORDER.map((option) => ({
          id: option,
          label: SURVEY_FORM_LABELS[option],
        }))}
        activeForm={form}
        periods={years.map((option) => ({
          id: option.toString(),
          label: formatSurveyPeriod(option),
        }))}
        activePeriod={selectedYear?.toString() ?? "all"}
      >
        <div
          key={`${form}-${selectedYear ?? "all"}`}
          className="flex flex-col gap-6"
        >
          <p className="-mb-3 text-caption text-muted-foreground">
            Each response counts toward the year its request was submitted.
          </p>

          {selected.length === 0 ? (
            <EmptyState
              title="No responses yet"
              description="Borrowers can fill this in once they submit their return addendum."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile
                  label="Responses"
                  index={0}
                  value={summary.responseCount.toString()}
                  note={periodLabel}
                />
                <StatTile
                  label="Overall score"
                  index={1}
                  value={overall?.average?.toFixed(1) ?? "–"}
                  note={
                    overall?.average != null &&
                    previousOverall?.average != null &&
                    previousYear !== null
                      ? formatDelta(
                          overall.average,
                          previousOverall.average,
                          previousYear,
                        )
                      : "out of 5"
                  }
                />
                <StatTile
                  label="Satisfied"
                  index={2}
                  value={share === null ? "–" : `${Math.round(share * 100)}%`}
                  note="Rated overall 4 or 5"
                />
                <StatTile
                  label="Lowest rated"
                  index={3}
                  value={lowest?.average?.toFixed(1) ?? "–"}
                  note={lowest?.shortLabel}
                />
              </div>

              <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
                <div className="flex flex-col gap-4">
                  <Card data-stagger style={staggerStyle(4)}>
                    <CardHeader>
                      <CardTitle>Score by area</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SurveyRadar
                        axes={radarAxes}
                        seriesLabel={periodLabel}
                        compareLabel={
                          previousYear === null
                            ? null
                            : formatSurveyPeriod(previousYear)
                        }
                      />
                    </CardContent>
                  </Card>

                  {trend.length >= MIN_TREND_YEARS && (
                    <Card data-stagger style={staggerStyle(5)}>
                      <CardHeader>
                        <CardTitle>Overall score by year</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SurveyTrend years={trend} />
                      </CardContent>
                    </Card>
                  )}
                </div>

                <SurveyRatings
                  questions={overall ? [overall, ...rankedAreas] : rankedAreas}
                />
              </div>

              <SurveyComments comments={summary.comments} />
            </>
          )}
        </div>
      </SurveyFilters>
    </div>
  );
}
