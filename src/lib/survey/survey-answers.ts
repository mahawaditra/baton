import { z } from "zod";
import type { SurveyForm } from "@/generated/prisma/enums";
import { toJakartaCalendarDate } from "@/lib/format";
import {
  SURVEY_COMMENT_MAX_LENGTH,
  SURVEY_DEFINITIONS,
  SURVEY_PAGE_ORDER,
  SURVEY_RATING_SCALE,
  commentFieldName,
  ratingFieldName,
} from "./survey-definition";

const RATING_VALUES = SURVEY_RATING_SCALE.map(({ value }) => String(value));

export type SurveyRatings = Record<string, number>;
export type SurveyComments = Record<string, string>;

export type ParsedSurveyAnswers =
  | { success: true; ratings: SurveyRatings; comments: SurveyComments }
  | { success: false; error: string };

export type ParsedSurveyResponse = {
  form: SurveyForm;
  ratings: SurveyRatings;
  comments: SurveyComments;
};

export type ParsedSurveySubmission =
  | { success: true; responses: ParsedSurveyResponse[] }
  | { success: false; error: string };

export function surveyYearOf(requestCreatedAt: Date): number {
  return toJakartaCalendarDate(requestCreatedAt).getUTCFullYear();
}

export function parseSurveyAnswers(
  form: SurveyForm,
  values: Record<string, string | undefined>,
): ParsedSurveyAnswers {
  const { questions, comments } = SURVEY_DEFINITIONS[form];

  const shape = Object.fromEntries([
    ...questions.map((question) => [
      ratingFieldName(form, question.key),
      z.enum(RATING_VALUES),
    ]),
    ...comments.map((comment) => [
      commentFieldName(form, comment.key),
      z
        .string()
        .transform((value) => value.replace(/\r\n/g, "\n").trim())
        .pipe(z.string().max(SURVEY_COMMENT_MAX_LENGTH))
        .optional(),
    ]),
  ]);

  const parsed = z.object(shape).safeParse(values);
  if (!parsed.success) {
    const tooLong = parsed.error.issues.some(
      (issue) => issue.code === "too_big",
    );
    return {
      success: false,
      error: tooLong
        ? `Komentar maksimal ${SURVEY_COMMENT_MAX_LENGTH} karakter.`
        : "Semua pertanyaan pilihan wajib dijawab.",
    };
  }

  const data = parsed.data as Record<string, string | undefined>;

  const ratings: SurveyRatings = {};
  for (const question of questions) {
    ratings[question.key] = Number(data[ratingFieldName(form, question.key)]);
  }

  const commentValues: SurveyComments = {};
  for (const comment of comments) {
    const value = data[commentFieldName(form, comment.key)];
    if (value) commentValues[comment.key] = value;
  }

  return { success: true, ratings, comments: commentValues };
}

export function parseSurveySubmission(
  values: Record<string, string | undefined>,
): ParsedSurveySubmission {
  const responses: ParsedSurveyResponse[] = [];
  for (const form of SURVEY_PAGE_ORDER) {
    const answers = parseSurveyAnswers(form, values);
    if (!answers.success) return answers;
    responses.push({
      form,
      ratings: answers.ratings,
      comments: answers.comments,
    });
  }
  return { success: true, responses };
}
