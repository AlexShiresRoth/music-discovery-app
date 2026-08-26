import { enforceRateLimitWith } from "@/lib/rate-limit";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("enforceRateLimitWith", () => {
  const limit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("returns undefined when the request is allowed", async () => {
    limit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60_000,
    });

    const result = await enforceRateLimitWith({ limit }, "1.2.3.4");

    expect(result).toBeUndefined();
    expect(limit).toHaveBeenCalledWith("1.2.3.4");
  });

  it("returns a 429 response when the request is blocked", async () => {
    const now = 1_700_000_000_000;
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const reset = now + 45_000;
    limit.mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset,
    });

    const result = await enforceRateLimitWith({ limit }, "report:9.9.9.9");

    expect(result).toBeInstanceOf(Response);
    expect(result!.status).toBe(429);

    const body = await result!.json();
    expect(body).toEqual({
      message: "Too many requests. Try again later.",
    });

    expect(result!.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(result!.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(result!.headers.get("X-RateLimit-Reset")).toBe(String(reset));
    expect(result!.headers.get("Retry-After")).toBe("45");
    expect(limit).toHaveBeenCalledWith("report:9.9.9.9");
  });

  it("never returns a negative Retry-After", async () => {
    const now = 1_700_000_000_000;
    vi.useFakeTimers();
    vi.setSystemTime(now);

    limit.mockResolvedValue({
      success: false,
      limit: 10,
      remaining: 0,
      reset: now - 5_000,
    });

    const result = await enforceRateLimitWith({ limit }, "ip");

    expect(result!.headers.get("Retry-After")).toBe("0");
  });
});
