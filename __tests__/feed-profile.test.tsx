import FeedProfile from "@/components/feed-profile";
import type { ProfileWithSongClips } from "@/lib/db/types";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/hooks/intersectionobserver", () => ({
  useIntersectionObserver: vi.fn(),
}));

vi.mock("@/components/empty-state", () => ({
  default: ({
    message,
    icon,
  }: {
    message: string;
    icon?: React.ReactNode;
  }) => (
    <div data-testid="empty-state">
      {icon}
      <p>{message}</p>
    </div>
  ),
}));

vi.mock("@/components/clip-display", () => ({
  default: ({
    index,
    isActive,
    onFinish,
  }: {
    index: number;
    isActive: boolean;
    onFinish: () => void;
  }) => (
    <div
      data-testid={`clip-${index}`}
      data-clip-slide
      data-clip-index={index}
      data-active={isActive ? "true" : "false"}
    >
      <button
        type="button"
        aria-label={`Finish clip ${index + 1}`}
        onClick={onFinish}
      >
        Finish
      </button>
    </div>
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

function renderFeedProfile(
  overrides: {
    profile?: ProfileWithSongClips;
    activeProfileIndex?: number;
    currentIndex?: number;
    advanceToNextProfile?: (index: number) => void;
    clipsLength?: number;
  } = {},
) {
  const advanceToNextProfile = overrides.advanceToNextProfile ?? vi.fn();
  const profile = overrides.profile ?? baseProfile;
  const clipsLength = overrides.clipsLength ?? profile.songClips.length;

  const result = render(
    <FeedProfile
      profile={profile}
      activeProfileIndex={overrides.activeProfileIndex ?? 0}
      currentIndex={overrides.currentIndex ?? 0}
      advanceToNextProfile={advanceToNextProfile}
      clipsLength={clipsLength}
    />,
  );

  return { ...result, advanceToNextProfile };
}

describe("FeedProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders profile name, genre, and location", () => {
    renderFeedProfile();

    expect(screen.getByText("Test Band")).toBeDefined();
    expect(screen.getByText("Rock")).toBeDefined();
    expect(screen.getByText("Austin, TX, US")).toBeDefined();
  });

  it("shows a shared empty image state when there is no image", () => {
    renderFeedProfile({
      profile: { ...baseProfile, imageUrl: null } as ProfileWithSongClips,
    });

    expect(screen.getByTestId("empty-state")).toBeDefined();
    expect(screen.getByText("No Image Yet.")).toBeDefined();
  });

  it("links the profile name to the public profile page", () => {
    renderFeedProfile();

    expect(screen.getByRole("link", { name: "Test Band" })).toHaveProperty(
      "href",
      "http://localhost:3000/profiles/1",
    );
  });

  it("renders a clip display per song clip", () => {
    renderFeedProfile();

    expect(screen.getByTestId("clip-0")).toBeDefined();
    expect(screen.getByTestId("clip-1")).toBeDefined();
  });

  it("renders a clip indicator button per song clip", () => {
    renderFeedProfile();

    expect(
      screen.getByRole("button", { name: "Go to clip 1" }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Go to clip 2" }),
    ).toBeDefined();
  });

  describe("continuous play", () => {
    it("marks the first clip active for the active profile", () => {
      renderFeedProfile();

      expect(screen.getByTestId("clip-0").getAttribute("data-active")).toBe(
        "true",
      );
      expect(screen.getByTestId("clip-1").getAttribute("data-active")).toBe(
        "false",
      );
    });

    it("does not mark clips active when this profile is not active", () => {
      renderFeedProfile({ activeProfileIndex: 1, currentIndex: 0 });

      expect(screen.getByTestId("clip-0").getAttribute("data-active")).toBe(
        "false",
      );
      expect(screen.getByTestId("clip-1").getAttribute("data-active")).toBe(
        "false",
      );
    });

    it("advances to the next clip when the current clip finishes", () => {
      const scrollIntoView = vi.fn();
      HTMLElement.prototype.scrollIntoView = scrollIntoView;

      renderFeedProfile();

      fireEvent.click(screen.getByRole("button", { name: "Finish clip 1" }));

      expect(screen.getByTestId("clip-0").getAttribute("data-active")).toBe(
        "false",
      );
      expect(screen.getByTestId("clip-1").getAttribute("data-active")).toBe(
        "true",
      );
      expect(scrollIntoView).toHaveBeenCalled();
    });

    it("advances to the next profile after the last clip finishes", () => {
      const advanceToNextProfile = vi.fn();
      HTMLElement.prototype.scrollIntoView = vi.fn();

      renderFeedProfile({ advanceToNextProfile });

      fireEvent.click(screen.getByRole("button", { name: "Finish clip 1" }));
      fireEvent.click(screen.getByRole("button", { name: "Finish clip 2" }));

      expect(advanceToNextProfile).toHaveBeenCalledWith(1);
    });

    it("advances to the next profile immediately when there is only one clip", () => {
      const advanceToNextProfile = vi.fn();
      const singleClipProfile = {
        ...baseProfile,
        songClips: [baseProfile.songClips[0]],
      } as unknown as ProfileWithSongClips;

      renderFeedProfile({
        profile: singleClipProfile,
        advanceToNextProfile,
        clipsLength: 1,
      });

      fireEvent.click(screen.getByRole("button", { name: "Finish clip 1" }));

      expect(advanceToNextProfile).toHaveBeenCalledWith(1);
    });
  });
});
