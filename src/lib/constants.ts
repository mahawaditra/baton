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
  Contrabass: "08",
  Clarinet: "67",
  Oboe: "91",
  Bassoon: "35",
  Trumpet: "74",
  "French Horn": "26",
  Trombone: "59",
  Tuba: "12",
};

export const MARQUEE_TEXT =
  "VIOLIN × VIOLA × CELLO × CONTRABASS × FRENCH HORN × TRUMPET × TROMBONE × TUBA × OBOE × CLARINET × BASSOON × FLUTE × PERCUSSION ×";
