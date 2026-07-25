import FeedProfile from "@/components/feed-profile";
import type { ProfileWithSongClips } from "@/lib/db/types";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/hooks/intersectionobserver", () => ({
  useIntersectionObserver: vi.fn(),
}));

vi.mock("@/components/clip-display", () => ({
  default: ({ index }: { index: number }) => (
    <div data-testid={`clip-${index}`} />
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const baseProfile = {
  id: 1,
  profileName: "Test Band",
  fullName: "Test User",
  contactEmail: "test@example.com",
  bio: "Bio",
  genre: "Rock",
  joinedDate: new Date("2024-01-01"),
  isVerified: true,
  songClips: [
    {
      id: "clip-1",
      title: "Clip One",
      db_url: "https://example.com/1.mp3",
      full_song_url: null,
      slot: 0,
      profileId: 1,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "clip-2",
      title: "Clip Two",
      db_url: "https://example.com/2.mp3",
      full_song_url: null,
      slot: 1,
      profileId: 1,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ],
  imageUrl: null,
  formattedLocation: "Austin, TX, USA",
  city: "Austin",
  country: "United States",
  countryCode: "us",
  state: "Texas",
  stateCode: "TX",
  lat: 30,
  lon: -97,
  location: null,
  website: { url: "", show: true },
  facebook: { url: "", show: true },
  instagram: { url: "https://instagram.com/test", show: true },
  tiktok: { url: "", show: true },
  spotify: { url: "https://open.spotify.com/artist/test", show: true },
  appleMusic: { url: "https://music.apple.com/artist/test", show: true },
  soundcloud: { url: "", show: true },
  bandcamp: { url: "", show: true },
  userRefId: "user-1",
} as unknown as ProfileWithSongClips;

describe("FeedProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders profile name, genre, and location", () => {
    render(
      <FeedProfile
        profile={baseProfile}
        activeProfileIndex={0}
        currentIndex={0}
      />,
    );

    expect(screen.getByText("Test Band")).toBeDefined();
    expect(screen.getByText("Rock")).toBeDefined();
    expect(screen.getByText("Austin, TX, US")).toBeDefined();
  });

  it("links the profile name to the public profile page", () => {
    render(
      <FeedProfile
        profile={baseProfile}
        activeProfileIndex={0}
        currentIndex={0}
      />,
    );

    expect(screen.getByRole("link", { name: "Test Band" })).toHaveProperty(
      "href",
      "http://localhost:3000/profiles/1",
    );
  });

  it("renders a clip display per song clip", () => {
    render(
      <FeedProfile
        profile={baseProfile}
        activeProfileIndex={0}
        currentIndex={0}
      />,
    );

    expect(screen.getByTestId("clip-0")).toBeDefined();
    expect(screen.getByTestId("clip-1")).toBeDefined();
  });

  it("renders a clip indicator button per song clip", () => {
    render(
      <FeedProfile
        profile={baseProfile}
        activeProfileIndex={0}
        currentIndex={0}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Go to clip 1" }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Go to clip 2" }),
    ).toBeDefined();
  });
});
