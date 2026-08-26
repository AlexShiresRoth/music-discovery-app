import sitemap from "@/app/sitemap";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetPublicProfilesForSitemap } = vi.hoisted(() => ({
  mockGetPublicProfilesForSitemap: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getPublicProfilesForSitemap: mockGetPublicProfilesForSitemap,
}));

const originalEnv = { ...process.env };

describe("sitemap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = "https://music.example.com";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("includes home, clips, legal pages, and public profile URLs", async () => {
    mockGetPublicProfilesForSitemap.mockResolvedValue([
      {
        id: 12,
        updatedAt: new Date("2026-08-01T00:00:00.000Z"),
        imageUrl: "https://cdn.example.com/nora.jpg",
      },
      {
        id: 3,
        updatedAt: new Date("2026-07-01T00:00:00.000Z"),
        imageUrl: null,
      },
    ]);

    const entries = await sitemap();

    expect(entries[0]).toMatchObject({
      url: "https://music.example.com",
      priority: 1,
    });
    expect(entries[1]).toMatchObject({
      url: "https://music.example.com/clips",
      priority: 0.9,
    });
    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "https://music.example.com/about",
          priority: 0.6,
        }),
        expect.objectContaining({
          url: "https://music.example.com/community-guidelines",
          priority: 0.5,
        }),
        expect.objectContaining({
          url: "https://music.example.com/privacy",
          priority: 0.3,
        }),
        expect.objectContaining({
          url: "https://music.example.com/terms-and-conditions",
          priority: 0.3,
        }),
        expect.objectContaining({
          url: "https://music.example.com/profiles/12",
          images: ["https://cdn.example.com/nora.jpg"],
          priority: 0.8,
        }),
        expect.objectContaining({
          url: "https://music.example.com/profiles/3",
          priority: 0.8,
        }),
      ]),
    );
    expect(entries.find((entry) => entry.url.endsWith("/profiles/3"))).not.toHaveProperty(
      "images",
    );
  });
});
