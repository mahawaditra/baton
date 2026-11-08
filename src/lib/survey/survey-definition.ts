import type { SurveyForm } from "@/generated/prisma/enums";

export const SURVEY_QUESTION_VERSION = 1;
export const SURVEY_COMMENT_MAX_LENGTH = 1000;

export const SURVEY_RATING_SCALE = [
  { value: 1, label: "Sangat nggak puas" },
  { value: 2, label: "Nggak puas" },
  { value: 3, label: "Biasa aja" },
  { value: 4, label: "Puas" },
  { value: 5, label: "Sangat puas" },
] as const;

export const SURVEY_RATING_VALUES: readonly number[] = SURVEY_RATING_SCALE.map(
  ({ value }) => value,
);

export type SurveyQuestion = {
  key: string;
  label: string;
  shortLabel: string;
};

export type SurveyCommentField = {
  key: string;
  label: string;
  hint?: string;
};

export type SurveyDefinition = {
  title: string;
  intro: string;
  questions: SurveyQuestion[];
  comments: SurveyCommentField[];
};

export const SURVEY_OVERALL_KEY = "overall";

export const SURVEY_PAGE_ORDER: readonly SurveyForm[] = ["baton", "logistik"];

export const SURVEY_DEFINITIONS: Record<SurveyForm, SurveyDefinition> = {
  baton: {
    title: "Survey BATON",
    intro:
      "Tentang BATON sebagai aplikasi, bukan tentang staf. Jawabanmu nggak ditautkan ke tiketmu.",
    questions: [
      {
        key: "request_form",
        label: "Ngajuin peminjaman lewat form",
        shortLabel: "Request form",
      },
      {
        key: "status_clarity",
        label:
          "Kejelasan status: kamu tahu sekarang giliran siapa dan harus ngapain",
        shortLabel: "Status clarity",
      },
      {
        key: "performance",
        label: "Performa: cepat, lancar, nggak lag",
        shortLabel: "Performance",
      },
      {
        key: "visual_design",
        label: "Desain visual BATON",
        shortLabel: "Visual design",
      },
      {
        key: "ease_of_use",
        label: "Kemudahan pakai: alurnya gampang dipahami tanpa perlu nanya",
        shortLabel: "Ease of use",
      },
      {
        key: "overall",
        label: "Secara keseluruhan, pengalaman pakai BATON",
        shortLabel: "Overall",
      },
    ],
    comments: [
      {
        key: "highlights",
        label: "Bagian mana yang paling bikin bingung/ribet atau paling suka?",
      },
      { key: "suggestion", label: "Ada saran buat BATON?" },
    ],
  },
  logistik: {
    title: "Survey Logistik",
    intro:
      "Tentang pelayanan tim Logistik OSUI. Jawabanmu nggak ditautkan ke tiketmu, jadi staf nggak tahu siapa yang ngisi.",
    questions: [
      {
        key: "response_speed",
        label: "Kecepatan staf merespons",
        shortLabel: "Response speed",
      },
      {
        key: "friendliness",
        label: "Keramahan staf",
        shortLabel: "Friendliness",
      },
      {
        key: "info_clarity",
        label: "Kejelasan info dari staf (syarat dan jadwal)",
        shortLabel: "Info clarity",
      },
      {
        key: "handover",
        label: "Proses serah terima instrumen di Sekre",
        shortLabel: "Handover",
      },
      {
        key: "instrument_condition",
        label: "Kondisi instrumen waktu kamu terima",
        shortLabel: "Instrument condition",
      },
      {
        key: "return",
        label: "Proses pengembalian instrumen",
        shortLabel: "Return process",
      },
      {
        key: "overall",
        label: "Secara keseluruhan, pelayanan Logistik",
        shortLabel: "Overall",
      },
    ],
    comments: [
      { key: "good", label: "Apa yang udah bagus?" },
      {
        key: "improve",
        label: "Apa yang perlu diperbaiki?",
        hint: "Nggak perlu sebut nama, cukup ceritain kejadiannya.",
      },
    ],
  },
};

export function isSurveyForm(value: string): value is SurveyForm {
  return Object.hasOwn(SURVEY_DEFINITIONS, value);
}

export function ratingFieldName(form: SurveyForm, key: string): string {
  return `${form}_rating_${key}`;
}

export function commentFieldName(form: SurveyForm, key: string): string {
  return `${form}_comment_${key}`;
}
