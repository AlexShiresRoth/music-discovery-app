import { beforeEach, vi } from "vitest";

vi.mock("@/lib/db/redis", () => ({
  enforceRateLimit: vi.fn(async () => undefined),
  limiters: {},
  redis: {},
}));

beforeEach(() => {
  if (typeof window !== "undefined" && !window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      })),
    });
  }
});
