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

export const conditionColor: Record<string, string> = {
  ok: "bg-green-100 text-green-800",
  need_repair: "bg-yellow-100 text-yellow-800",
  retired: "bg-gray-100 text-gray-800",
  lost: "bg-red-100 text-red-800",
};
