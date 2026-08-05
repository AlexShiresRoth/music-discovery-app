import {
  extractUrlValue,
  isValidUrl,
  validateSocialFields,
  validateSocialUrl,
  validateUrl,
} from "@/lib/validation/url";
import { describe, expect, it } from "vitest";

describe("validateUrl / isValidUrl", () => {
  it("allows empty optional values", () => {
    expect(isValidUrl("")).toBe(true);
    expect(isValidUrl("   ")).toBe(true);
    expect(isValidUrl(null)).toBe(true);
    expect(isValidUrl(undefined)).toBe(true);
  });

  it("accepts http and https URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://example.com/path?q=1")).toBe(true);
  });

  it("rejects unparseable strings and non-http protocols", () => {
    expect(validateUrl("not-a-url", "Full Song URL")).toEqual({
      ok: false,
      error: 'Full Song URL: "not-a-url" is not a valid URL',
    });
    expect(isValidUrl("ftp://example.com")).toBe(false);
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("validateSocialUrl", () => {
  it("requires a matching platform for non-website links", () => {
    expect(validateSocialUrl("instagram", "https://example.com/band")).toEqual({
      ok: false,
      error:
        'instagram: "https://example.com/band" is not a valid instagram URL',
    });
    expect(
      validateSocialUrl("instagram", "https://instagram.com/band"),
    ).toEqual({ ok: true });
  });

  it("accepts apple music hostnames without the appleMusic substring", () => {
    expect(
      validateSocialUrl(
        "appleMusic",
        "https://music.apple.com/us/artist/123",
      ),
    ).toEqual({ ok: true });
  });

  it("allows any http(s) URL for website", () => {
    expect(validateSocialUrl("website", "https://myband.example")).toEqual({
      ok: true,
    });
  });
});

describe("validateSocialFields / extractUrlValue", () => {
  it("reads plain strings and { url } objects", () => {
    expect(extractUrlValue("https://x.com")).toBe("https://x.com");
    expect(extractUrlValue({ url: "https://x.com", show: true })).toBe(
      "https://x.com",
    );
  });

  it("returns the first invalid social field error", () => {
    expect(
      validateSocialFields({
        website: { url: "https://ok.example", show: true },
        tiktok: { url: "not-a-tiktok-url", show: true },
        spotify: { url: "https://open.spotify.com/artist/1", show: true },
      }),
    ).toEqual({
      ok: false,
      error: 'tiktok: "not-a-tiktok-url" is not a valid tiktok URL',
    });
  });
});
