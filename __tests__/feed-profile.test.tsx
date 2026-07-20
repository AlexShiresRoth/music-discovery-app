import FeedProfile from "@/components/feed-profile";
import type { ProfileWithSongClips } from "@/lib/db/types";
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/hooks/intersectionobserver", () => ({
  useIntersectionObserver: vi.fn(),
}));

vi.mock("@/components/clip-display", () => ({
  default: ({ index }: { index: number }) => (
    <div data-testid={`clip-${index}`} />
  ),
}));

let resizeCallback: ResizeObserverCallback | null = null;

class MockResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeCallback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

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
  city: "Austin",
  state: "TX",
  country: "US",
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

function setLinkOffsetTops(tops: number[]) {
  const links = document.querySelectorAll<HTMLElement>("[data-profile-link]");
  links.forEach((link, index) => {
    Object.defineProperty(link, "offsetTop", {
      configurable: true,
      get: () => tops[index] ?? 0,
    });
  });
}

describe("FeedProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resizeCallback = null;
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
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
    expect(screen.getByText("Austin - TX")).toBeDefined();
  });

  it("renders only social links that are present", () => {
    render(
      <FeedProfile
        profile={baseProfile}
        activeProfileIndex={0}
        currentIndex={0}
      />,
    );

    expect(screen.getByRole("link", { name: "Spotify" })).toHaveProperty(
      "href",
      "https://open.spotify.com/artist/test",
    );
    expect(screen.getByRole("link", { name: "Apple Music" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Instagram" })).toBeDefined();
    expect(screen.queryByRole("link", { name: "Bandcamp" })).toBeNull();
    expect(screen.queryByRole("link", { name: "SoundCloud" })).toBeNull();
  });

  it("hides social links when show is false", () => {
    render(
      <FeedProfile
        profile={{
          ...baseProfile,
          spotify: { url: "https://open.spotify.com/artist/test", show: false },
          appleMusic: {
            url: "https://music.apple.com/artist/test",
            show: true,
          },
          instagram: { url: "https://instagram.com/test", show: false },
        }}
        activeProfileIndex={0}
        currentIndex={0}
      />,
    );

    expect(screen.queryByRole("link", { name: "Spotify" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Instagram" })).toBeNull();
    expect(screen.getByRole("link", { name: "Apple Music" })).toBeDefined();
  });

  it("shows separators between links on the same row", () => {
    const { container } = render(
      <FeedProfile
        profile={baseProfile}
        activeProfileIndex={0}
        currentIndex={0}
      />,
    );

    setLinkOffsetTops([0, 0, 0]);
    act(() => {
      resizeCallback?.([], {} as ResizeObserver);
    });

    const separators = container.querySelectorAll('[aria-hidden="true"]');
    expect(separators).toHaveLength(2);
    separators.forEach((separator) => {
      expect(separator.textContent).toBe("/");
    });
  });

  it("hides separators when links wrap to a new row", () => {
    const { container } = render(
      <FeedProfile
        profile={baseProfile}
        activeProfileIndex={0}
        currentIndex={0}
      />,
    );

    setLinkOffsetTops([0, 0, 20]);
    act(() => {
      resizeCallback?.([], {} as ResizeObserver);
    });

    const separators = container.querySelectorAll('[aria-hidden="true"]');
    expect(separators).toHaveLength(1);
    expect(separators[0]?.textContent).toBe("/");
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
