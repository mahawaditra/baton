import { customAlphabet } from "nanoid";

export const generateTicketId = customAlphabet(
  "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz",
  7,
);
export const generateAccessCode = customAlphabet(
  "23456789ABCDEFGHJKMNPQRSTUVWXYZ",
  6,
);
