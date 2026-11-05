import * as Sentry from "@sentry/nextjs";
import { unstable_rethrow } from "next/navigation";

export const SERVER_ERROR_MESSAGE =
  "Ada masalah di server kami, jadi data kamu belum tersimpan. Coba lagi sebentar lagi, atau hubungi Logistik OSUI Mahawaditra kalau masih gagal.";

export async function withServerErrorFallback<S>(
  run: () => Promise<S>,
  fallback: () => S,
): Promise<S> {
  try {
    return await run();
  } catch (error) {
    unstable_rethrow(error);
    Sentry.captureException(error);
    return fallback();
  }
}
