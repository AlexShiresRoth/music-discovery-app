import { enforceRateLimitWith } from "@/lib/rate-limit";
import { Duration, Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "process";

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 *
 * @param identifier
 * @param time
 * @param limit
 * @returns dynamic rate limiter
 */
function createRateLimiter(identifier: string, time: Duration, limit: number) {
  return new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(limit, time),
    analytics: true,
    prefix: identifier,
  });
}

export const limiters = {
  publicRead: createRateLimiter("rl:read", "1 m", 60),
  report: createRateLimiter("rl:report", "1 h", 5),
  feedback: createRateLimiter("rl:feedback", "1 h", 10),
  upload: createRateLimiter("rl:upload", "1 h", 10),
  mutate: createRateLimiter("rl:mutate", "1 m", 30),
  /** Confirmation / auth emails — tight limits to limit inbox spam. */
  authEmail: createRateLimiter("rl:auth-email", "1 h", 3),
};

export async function enforceRateLimit(
  identifier: keyof typeof limiters,
  key: string,
) {
  return enforceRateLimitWith(limiters[identifier], key);
}
