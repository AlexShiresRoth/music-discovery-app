import { getSiteUrl } from "@/lib/site-url";
import { afterEach, describe, expect, it } from "vitest";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("getSiteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://music.example.com/";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "ignored.vercel.app";
    process.env.VERCEL_URL = "also-ignored.vercel.app";

    expect(getSiteUrl()).toBe("https://music.example.com");
  });

  it("falls back to Vercel production URL", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "music.vercel.app";

    expect(getSiteUrl()).toBe("https://music.vercel.app");
  });

  it("defaults to localhost", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;

    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});
