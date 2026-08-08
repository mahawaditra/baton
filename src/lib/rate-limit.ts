import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const redis = Redis.fromEnv();

// 5x wrong attempts per 10 minutes on access_code per ticket
export const accessCodeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "ratelimit:access-code",
});

// 3x submit requests submission /request per hour per IP
export const submitRequestLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "ratelimit:submit-request",
});

// 10x status search requests /status-search per 10 minutes per IP
export const statusSearchLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 m"),
  prefix: "ratelimit:status-search",
});

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}
