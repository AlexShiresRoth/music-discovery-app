import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
  getProfilesWithSongClips: vi.fn(),
  getTotalProfilesWithSongClips: vi.fn(),
  getProfilesWithSongClipsByQuery: vi.fn(),
  getProfilesWithSongClipsByLocation: vi.fn(),
  getTotalProfilesWithSongClipsByLocation: vi.fn(),
}));

vi.mock("@/lib/auth/clips", () => ({
  getSongClips: vi.fn(),
}));

vi.mock("@/components/feed-list", () => ({
  default: () => null,
}));

vi.mock("@/components/breadcrumbs", () => ({
  default: () => null,
}));

vi.mock("@/app/login/auth-button", () => ({
  default: () => null,
}));

vi.mock("@/app/login/login-form", () => ({
  default: () => null,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

let homeMetadata: Awaited<typeof import("@/app/page")>["metadata"];
let clipsMetadata: Awaited<typeof import("@/app/clips/page")>["metadata"];
let loginMetadata: Awaited<typeof import("@/app/login/page")>["metadata"];
let profileLayoutMetadata: Awaited<
  typeof import("@/app/profile/layout")
>["metadata"];
let artistMetadata: Awaited<typeof import("@/app/artist/page")>["metadata"];
let locationMetadata: Awaited<typeof import("@/app/location/page")>["metadata"];

beforeAll(async () => {
  ({ metadata: homeMetadata } = await import("@/app/page"));
  ({ metadata: clipsMetadata } = await import("@/app/clips/page"));
  ({ metadata: loginMetadata } = await import("@/app/login/page"));
  ({ metadata: profileLayoutMetadata } = await import("@/app/profile/layout"));
  ({ metadata: artistMetadata } = await import("@/app/artist/page"));
  ({ metadata: locationMetadata } = await import("@/app/location/page"));
});

describe("route metadata", () => {
  it("gives home and clips indexable canonical URLs", () => {
    expect(homeMetadata.alternates).toEqual({ canonical: "/" });
    expect(clipsMetadata.alternates).toEqual({ canonical: "/clips" });
    expect(clipsMetadata.title).toBe("Clips");
  });

  it("noindexes auth and thin param pages", () => {
    expect(loginMetadata.robots).toEqual({ index: false, follow: false });
    expect(profileLayoutMetadata.robots).toEqual({
      index: false,
      follow: false,
    });
    expect(artistMetadata.robots).toEqual({ index: false, follow: true });
    expect(locationMetadata.robots).toEqual({ index: false, follow: true });
  });
});
