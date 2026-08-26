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
let aboutMetadata: Awaited<typeof import("@/app/about/page")>["metadata"];
let privacyMetadata: Awaited<typeof import("@/app/privacy/page")>["metadata"];
let termsMetadata: Awaited<
  typeof import("@/app/terms-and-conditions/page")
>["metadata"];
let guidelinesMetadata: Awaited<
  typeof import("@/app/community-guidelines/page")
>["metadata"];

beforeAll(async () => {
  ({ metadata: homeMetadata } = await import("@/app/page"));
  ({ metadata: clipsMetadata } = await import("@/app/clips/page"));
  ({ metadata: loginMetadata } = await import("@/app/login/page"));
  ({ metadata: profileLayoutMetadata } = await import("@/app/profile/layout"));
  ({ metadata: artistMetadata } = await import("@/app/artist/page"));
  ({ metadata: locationMetadata } = await import("@/app/location/page"));
  ({ metadata: aboutMetadata } = await import("@/app/about/page"));
  ({ metadata: privacyMetadata } = await import("@/app/privacy/page"));
  ({ metadata: termsMetadata } = await import(
    "@/app/terms-and-conditions/page"
  ));
  ({ metadata: guidelinesMetadata } = await import(
    "@/app/community-guidelines/page"
  ));
});

describe("route metadata", () => {
  it("gives home and clips indexable canonical URLs", () => {
    expect(homeMetadata.alternates).toEqual({ canonical: "/" });
    expect(clipsMetadata.alternates).toEqual({ canonical: "/clips" });
    expect(clipsMetadata.title).toBe("Clips");
  });

  it("gives about and legal pages indexable canonical URLs", () => {
    expect(aboutMetadata.alternates).toEqual({ canonical: "/about" });
    expect(aboutMetadata.title).toBe("About");
    expect(privacyMetadata.alternates).toEqual({ canonical: "/privacy" });
    expect(privacyMetadata.title).toBe("Privacy Policy");
    expect(termsMetadata.alternates).toEqual({
      canonical: "/terms-and-conditions",
    });
    expect(termsMetadata.title).toBe("Terms of Service");
    expect(guidelinesMetadata.alternates).toEqual({
      canonical: "/community-guidelines",
    });
    expect(guidelinesMetadata.title).toBe("Community Guidelines");
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
