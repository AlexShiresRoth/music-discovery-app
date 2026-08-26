export type RateLimitOutcome = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

export type RateLimiter = {
  limit: (key: string) => Promise<RateLimitOutcome>;
};

export async function enforceRateLimitWith(
  limiter: RateLimiter,
  key: string,
) {
  const { success, limit, remaining, reset } = await limiter.limit(key);

  if (!success) {
    return Response.json(
      { message: "Too many requests. Try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(
            Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
          ),
        },
      },
    );
  }
}
