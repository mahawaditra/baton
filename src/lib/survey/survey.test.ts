import { describe, it, expect } from "vitest";
import { SurveyForm } from "@/generated/prisma/enums";
import {
  parseSurveyAnswers,
  parseSurveySubmission,
  surveyYearOf,
} from "./survey-answers";
import {
  SURVEY_COMMENT_MAX_LENGTH,
  SURVEY_DEFINITIONS,
  SURVEY_PAGE_ORDER,
  commentFieldName,
  isSurveyForm,
  ratingFieldName,
} from "./survey-definition";
import {
  areaQuestions,
  formatSurveyPeriod,
  lowestRatedArea,
  overallQuestion,
  satisfiedShare,
  summarizeSurvey,
  summarizeYears,
} from "./survey-report";

function allRatings(form: SurveyForm, value = "4") {
  return Object.fromEntries(
    SURVEY_DEFINITIONS[form].questions.map((question) => [
      ratingFieldName(form, question.key),
      value,
    ]),
  );
}

describe("SURVEY_DEFINITIONS", () => {
  it("has a definition for every SurveyForm", () => {
    for (const form of Object.values(SurveyForm)) {
      expect(SURVEY_DEFINITIONS[form].questions.length).toBeGreaterThan(0);
    }
  });

  it("puts every form on exactly one survey page", () => {
    expect([...SURVEY_PAGE_ORDER].sort()).toEqual(
      Object.values(SurveyForm).sort(),
    );
  });

  it("keeps field names apart across forms that share a question key", () => {
    expect(ratingFieldName("baton", "overall")).not.toBe(
      ratingFieldName("logistik", "overall"),
    );
  });

  it("uses unique keys inside each form", () => {
    for (const form of Object.values(SurveyForm)) {
      const { questions, comments } = SURVEY_DEFINITIONS[form];
      const keys = [...questions, ...comments].map((item) => item.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("does not ask the Logistik form about the deposit", () => {
    const { questions, comments, intro } = SURVEY_DEFINITIONS.logistik;
    const text = [
      intro,
      ...questions.map((q) => q.label),
      ...comments.map((c) => c.label),
    ]
      .join(" ")
      .toLowerCase();
    expect(text).not.toContain("deposit");
  });
});

describe("isSurveyForm", () => {
  it("accepts only real forms, including against prototype keys", () => {
    expect(isSurveyForm("baton")).toBe(true);
    expect(isSurveyForm("logistik")).toBe(true);
    expect(isSurveyForm("other")).toBe(false);
    expect(isSurveyForm("constructor")).toBe(false);
    expect(isSurveyForm("__proto__")).toBe(false);
  });
});

describe("parseSurveyAnswers", () => {
  it("turns ratings into numbers and leaves out blank comments", () => {
    const result = parseSurveyAnswers("logistik", {
      ...allRatings("logistik", "5"),
      [commentFieldName("logistik", "good")]: "  Cepat banget  ",
      [commentFieldName("logistik", "improve")]: "   ",
    });
    expect(result).toMatchObject({ success: true });
    if (!result.success) return;
    expect(result.ratings.overall).toBe(5);
    expect(result.comments).toEqual({ good: "Cepat banget" });
  });

  it("refuses a missing rating", () => {
    const values = allRatings("baton");
    delete values[ratingFieldName("baton", "performance")];
    expect(parseSurveyAnswers("baton", values)).toEqual({
      success: false,
      error: "Semua pertanyaan pilihan wajib dijawab.",
    });
  });

  it("refuses ratings outside the scale", () => {
    for (const value of ["0", "6", "4.5", "", "na", "<script>"]) {
      const result = parseSurveyAnswers("baton", {
        ...allRatings("baton"),
        [ratingFieldName("baton", "overall")]: value,
      });
      expect(result.success).toBe(false);
    }
  });

  it("refuses a comment over the limit with its own message", () => {
    expect(
      parseSurveyAnswers("baton", {
        ...allRatings("baton"),
        [commentFieldName("baton", "suggestion")]: "x".repeat(
          SURVEY_COMMENT_MAX_LENGTH + 1,
        ),
      }),
    ).toEqual({
      success: false,
      error: `Komentar maksimal ${SURVEY_COMMENT_MAX_LENGTH} karakter.`,
    });
  });

  it("counts a line break as one character, however the browser sent it", () => {
    const line = "x".repeat(SURVEY_COMMENT_MAX_LENGTH / 2 - 1);
    const result = parseSurveyAnswers("baton", {
      ...allRatings("baton"),
      [commentFieldName("baton", "suggestion")]: `${line}\r\n\r\n${line}`,
    });
    expect(result).toMatchObject({ success: true });
    if (result.success) {
      expect(result.comments.suggestion).toBe(`${line}\n\n${line}`);
    }
  });

  it("drops fields the form does not define", () => {
    const result = parseSurveyAnswers("baton", {
      ...allRatings("baton"),
      ticketId: "26590314",
      [commentFieldName("baton", "injected")]: "nope",
    });
    expect(result).toMatchObject({ success: true });
    if (!result.success) return;
    expect(Object.keys(result.ratings)).toEqual(
      SURVEY_DEFINITIONS.baton.questions.map((q) => q.key),
    );
    expect(result.comments).toEqual({});
  });
});

describe("parseSurveySubmission", () => {
  const complete = {
    ...allRatings("baton", "2"),
    ...allRatings("logistik", "5"),
  };

  it("returns one response per form, each with its own answers", () => {
    const result = parseSurveySubmission(complete);
    expect(result).toMatchObject({ success: true });
    if (!result.success) return;
    expect(result.responses.map((r) => r.form)).toEqual(SURVEY_PAGE_ORDER);
    expect(result.responses[0].ratings.overall).toBe(2);
    expect(result.responses[1].ratings.overall).toBe(5);
  });

  it("refuses the whole submission when one form is incomplete", () => {
    expect(parseSurveySubmission(allRatings("baton")).success).toBe(false);
    expect(parseSurveySubmission(allRatings("logistik")).success).toBe(false);
  });
});

describe("summarizeSurvey", () => {
  it("counts ratings and the average", () => {
    const summary = summarizeSurvey("baton", [
      { ratings: { overall: 5 }, comments: {} },
      { ratings: { overall: 2 }, comments: {} },
    ]);
    const overall = summary.questions.find((q) => q.key === "overall")!;
    expect(summary.responseCount).toBe(2);
    expect(overall.answered).toBe(2);
    expect(overall.average).toBe(3.5);
    expect(overall.counts.find((c) => c.value === 5)?.count).toBe(1);
  });

  it("has no average for a question nobody rated", () => {
    const summary = summarizeSurvey("baton", [{ ratings: {}, comments: {} }]);
    const overall = summary.questions.find((q) => q.key === "overall")!;
    expect(overall.average).toBeNull();
  });

  it("ignores malformed stored values and keys from older versions", () => {
    const summary = summarizeSurvey("baton", [
      {
        ratings: { overall: 9, removed_question: 5 },
        comments: { highlights: 3 },
      },
      { ratings: null, comments: "nope" },
      { ratings: ["overall"], comments: [] },
    ]);
    const overall = summary.questions.find((q) => q.key === "overall")!;
    expect(overall.answered).toBe(0);
    expect(summary.questions.map((q) => q.key)).not.toContain(
      "removed_question",
    );
    expect(summary.comments.every((c) => c.entries.length === 0)).toBe(true);
  });

  it("sorts comments so their order says nothing about who sent them first", () => {
    const summary = summarizeSurvey("baton", [
      { ratings: {}, comments: { suggestion: "Zebra" } },
      { ratings: {}, comments: { suggestion: "Apel" } },
    ]);
    const suggestion = summary.comments.find((c) => c.key === "suggestion")!;
    expect(suggestion.entries).toEqual(["Apel", "Zebra"]);
  });
});

describe("summary helpers", () => {
  const summary = summarizeSurvey("baton", [
    { ratings: { overall: 5, performance: 2, visual_design: 4 }, comments: {} },
    { ratings: { overall: 3, performance: 3, visual_design: 5 }, comments: {} },
  ]);

  it("keeps overall out of the area questions", () => {
    const keys = areaQuestions(summary).map(({ key }) => key);
    expect(keys).toContain("performance");
    expect(keys).not.toContain("overall");
    expect(overallQuestion(summary)?.average).toBe(4);
  });

  it("finds the lowest rated area, skipping unrated questions", () => {
    expect(lowestRatedArea(summary)?.key).toBe("performance");
    expect(lowestRatedArea(summarizeSurvey("baton", []))).toBeNull();
  });

  it("counts 4 and 5 as satisfied", () => {
    expect(satisfiedShare(overallQuestion(summary)!)).toBe(0.5);
    expect(
      satisfiedShare(overallQuestion(summarizeSurvey("baton", []))!),
    ).toBeNull();
  });

  it("summarizes years in ascending order", () => {
    expect(
      summarizeYears("baton", [
        { year: 2026, ratings: { overall: 4 }, comments: {} },
        { year: 2025, ratings: { overall: 2 }, comments: {} },
        { year: 2026, ratings: { overall: 5 }, comments: {} },
      ]),
    ).toEqual([
      { year: 2025, responseCount: 1, overallAverage: 2 },
      { year: 2026, responseCount: 2, overallAverage: 4.5 },
    ]);
  });
});

describe("surveyYearOf", () => {
  it("uses the calendar year in Jakarta, not in UTC", () => {
    expect(surveyYearOf(new Date("2025-12-31T16:59:00Z"))).toBe(2025);
    expect(surveyYearOf(new Date("2025-12-31T17:00:00Z"))).toBe(2026);
  });
});

describe("formatSurveyPeriod", () => {
  it("shows a request year as the span it runs across", () => {
    expect(formatSurveyPeriod(2025)).toBe("2025–2026");
  });
});
