export const REQUESTABLE_INSTRUMENT_TYPES = [
  "Violin",
  "Viola",
  "Cello",
  "Contrabass",
  "Clarinet",
  "Oboe",
  "Bassoon",
  "Trumpet",
  "French Horn",
  "Trombone",
  "Tuba",
] as const;

export type RequestableInstrumentType =
  (typeof REQUESTABLE_INSTRUMENT_TYPES)[number];

export const INSTRUMENT_TYPE_CODES: Record<
  RequestableInstrumentType,
  string
> = {
  Violin: "47",
  Viola: "82",
  Cello: "19",
  Contrabass: "63",
  Clarinet: "08",
  Oboe: "91",
  Bassoon: "35",
  Trumpet: "74",
  "French Horn": "26",
  Trombone: "59",
  Tuba: "12",
};

export const conditionColor: Record<string, string> = {
  ok: "bg-green-100 text-green-800",
  need_repair: "bg-yellow-100 text-yellow-800",
  retired: "bg-gray-100 text-gray-800",
  lost: "bg-red-100 text-red-800",
};

export const MARQUEE_TEXT =
  "VIOLIN × VIOLA × CELLO × CONTRABASS × FRENCH HORN × TRUMPET × TROMBONE × TUBA × OBOE × CLARINET × BASSOON × FLUTE × PERCUSSION ×";
