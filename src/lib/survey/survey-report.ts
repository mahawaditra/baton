import type { SurveyForm } from "@/generated/prisma/enums";
import {
  SURVEY_DEFINITIONS,
  SURVEY_OVERALL_KEY,
  SURVEY_RATING_SCALE,
} from "./survey-definition";

const SATISFIED_MIN_RATING = 4;

export function formatSurveyPeriod(year: number): string {
  return `${year}–${year + 1}`;
}

export type SurveyQuestionSummary = {
  key: string;
  label: string;
  shortLabel: string;
  counts: { value: number; label: string; count: number }[];
  answered: number;
  average: number | null;
};

export type SurveyCommentSummary = {
  key: string;
  label: string;
  entries: string[];
};

export type SurveySummary = {
  responseCount: number;
  questions: SurveyQuestionSummary[];
  comments: SurveyCommentSummary[];
};

export type SurveyYearSummary = {
  year: number;
  responseCount: number;
  overallAverage: number | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function summarizeSurvey(
  form: SurveyForm,
  responses: { ratings: unknown; comments: unknown }[],
): SurveySummary {
  const { questions, comments } = SURVEY_DEFINITIONS[form];
  const ratings = responses.map((response) => asRecord(response.ratings));
  const allComments = responses.map((response) => asRecord(response.comments));

  return {
    responseCount: responses.length,
    questions: questions.map((question) => {
      const scored = ratings
        .map((rating) => rating[question.key])
        .filter(
          (value): value is number =>
            typeof value === "number" &&
            SURVEY_RATING_SCALE.some((option) => option.value === value),
        );
      return {
        key: question.key,
        label: question.label,
        shortLabel: question.shortLabel,
        counts: SURVEY_RATING_SCALE.map((option) => ({
          value: option.value,
          label: option.label,
          count: scored.filter((value) => value === option.value).length,
        })),
        answered: scored.length,
        average:
          scored.length > 0
            ? scored.reduce((sum, value) => sum + value, 0) / scored.length
            : null,
      };
    }),
    comments: comments.map((comment) => ({
      key: comment.key,
      label: comment.label,
      entries: allComments
        .map((entry) => entry[comment.key])
        .filter(
          (entry): entry is string =>
            typeof entry === "string" && entry.length > 0,
        )
        .sort((a, b) => a.localeCompare(b, "id")),
    })),
  };
}

export function overallQuestion(
  summary: SurveySummary,
): SurveyQuestionSummary | undefined {
  return summary.questions.find(({ key }) => key === SURVEY_OVERALL_KEY);
}

export function areaQuestions(summary: SurveySummary): SurveyQuestionSummary[] {
  return summary.questions.filter(({ key }) => key !== SURVEY_OVERALL_KEY);
}

export function lowestRatedArea(
  summary: SurveySummary,
): SurveyQuestionSummary | null {
  let lowest: SurveyQuestionSummary | null = null;
  for (const question of areaQuestions(summary)) {
    if (question.average === null) continue;
    if (lowest === null || question.average < (lowest.average ?? 0)) {
      lowest = question;
    }
  }
  return lowest;
}

export function satisfiedShare(question: SurveyQuestionSummary): number | null {
  if (question.answered === 0) return null;
  const satisfied = question.counts
    .filter(({ value }) => value >= SATISFIED_MIN_RATING)
    .reduce((sum, { count }) => sum + count, 0);
  return satisfied / question.answered;
}

export function summarizeYears(
  form: SurveyForm,
  responses: { year: number; ratings: unknown; comments: unknown }[],
): SurveyYearSummary[] {
  const years = [...new Set(responses.map(({ year }) => year))].sort(
    (a, b) => a - b,
  );
  return years.map((year) => {
    const summary = summarizeSurvey(
      form,
      responses.filter((response) => response.year === year),
    );
    return {
      year,
      responseCount: summary.responseCount,
      overallAverage: overallQuestion(summary)?.average ?? null,
    };
  });
}
