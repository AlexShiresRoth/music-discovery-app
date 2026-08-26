import robots from "@/app/robots";
import { afterEach, describe, expect, it } from "vitest";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("robots", () => {
  it("allows public routes and blocks auth/utility paths", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://music.example.com";

    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: [
          "/",
          "/clips",
          "/profiles/",
          "/about",
          "/community-guidelines",
          "/privacy",
          "/terms-and-conditions",
        ],
        disallow: [
          "/profile$",
          "/profile/",
          "/login",
          "/api/",
          "/auth/",
          "/logout",
          "/artist",
          "/location",
          "/account",
        ],
      },
      sitemap: "https://music.example.com/sitemap.xml",
    });
  });
});
