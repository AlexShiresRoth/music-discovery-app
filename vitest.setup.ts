import { vi } from "vitest";

vi.mock("@/lib/db/redis", () => ({
  enforceRateLimit: vi.fn(async () => undefined),
  limiters: {},
  redis: {},
}));
