import crypto from "crypto";

const TOKEN_TTL_MS = 60_000;

function getSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not set.");
  return secret;
}

function sign(payloadB64: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`contract-download:${payloadB64}`)
    .digest("base64url");
}

export function signDownloadToken(ticketId: string): string {
  const payloadB64 = Buffer.from(
    JSON.stringify({ ticketId, exp: Date.now() + TOKEN_TTL_MS }),
  ).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifyDownloadToken(
  token: string,
  ticketId: string,
): boolean {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  const expected = Buffer.from(sign(payloadB64));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length) return false;
  if (!crypto.timingSafeEqual(expected, actual)) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    return (
      payload.ticketId === ticketId &&
      typeof payload.exp === "number" &&
      payload.exp > Date.now()
    );
  } catch {
    return false;
  }
}
