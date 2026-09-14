import { customAlphabet } from "nanoid";
import {
  INSTRUMENT_TYPE_CODES,
  type RequestableInstrumentType,
} from "./constants";

export function generateTicketId(
  instrumentType: RequestableInstrumentType,
): string {
  const yy = String(new Date().getFullYear() % 100).padStart(2, "0");
  const ii = INSTRUMENT_TYPE_CODES[instrumentType];
  const nnnn = customAlphabet("0123456789", 4)();
  return `${yy}${ii}${nnnn}`;
}

export const generateAccessCode = customAlphabet(
  "23456789ABCDEFGHJKMNPQRSTUVWXYZ",
  6,
);
