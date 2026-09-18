import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import * as Sentry from "@sentry/nextjs";

export const redis = Redis.fromEnv();

export const accessCodeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "ratelimit:access-code",
});

export const submitRequestLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "ratelimit:submit-request",
});

export const statusSearchLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 m"),
  prefix: "ratelimit:status-search",
});

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

export async function limitOrAllow(
  limiter: Ratelimit,
  identifier: string,
): Promise<{ success: boolean }> {
  try {
    return await limiter.limit(identifier);
  } catch (error) {
    Sentry.captureException(error);
    return { success: true };
  }
}
