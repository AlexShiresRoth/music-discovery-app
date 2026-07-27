import FeedList from "@/components/feed-list";
import type { ProfileWithSongClips } from "@/lib/db/types";
import { useFetchMoreProfiles } from "@/lib/hooks/useFetchMoreProfiles";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseSearchParams = vi.fn();
const mockUseFetchMoreProfiles = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

vi.mock("@/lib/hooks/useFetchMoreProfiles", () => ({
  useFetchMoreProfiles: (...args: unknown[]) => mockUseFetchMoreProfiles(...args),
}));

vi.mock("@/lib/hooks/intersectionobserver", () => ({
  useIntersectionObserver: vi.fn(),
}));

vi.mock("@/components/feed-profile", () => ({
  default: ({ profile }: { profile: ProfileWithSongClips }) => (
    <div data-profile-slide>{profile.profileName}</div>
  ),
}));

vi.mock("@/components/audio-controls", () => ({
  default: () => null,
}));

vi.mock("@/components/feed-overlay", () => ({
  default: () => null,
}));

vi.mock("@/context/feed-audio", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const initialProfiles = [
  { id: 1, profileName: "Band One", songClips: [] },
  { id: 2, profileName: "Band Two", songClips: [] },
] as unknown as ProfileWithSongClips[];

describe("FeedList infinite load", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    mockUseFetchMoreProfiles.mockReturnValue({
      fetchedProfiles: initialProfiles,
      error: null,
      isLoading: false,
    });
  });

  it("passes url genres and coordinates into the fetch hook", () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams("g=Rock&g=Jazz&lat=30.27&lon=-97.74"),
    );

    render(<FeedList profiles={initialProfiles} />);

    expect(mockUseFetchMoreProfiles).toHaveBeenCalledWith(
      expect.objectContaining({
        profiles: initialProfiles,
        limit: 15,
        genres: ["Rock", "Jazz"],
        latitude: 30.27,
        longitude: -97.74,
      }),
    );
  });

  it("renders fetched profiles from the hook", () => {
    mockUseFetchMoreProfiles.mockReturnValue({
      fetchedProfiles: [
        ...initialProfiles,
        { id: 3, profileName: "Band Three", songClips: [] },
      ] as unknown as ProfileWithSongClips[],
      error: null,
      isLoading: false,
    });

    render(<FeedList profiles={initialProfiles} />);

    expect(screen.getByText("Band One")).toBeDefined();
    expect(screen.getByText("Band Two")).toBeDefined();
    expect(screen.getByText("Band Three")).toBeDefined();
  });

  it("shows a loading indicator while fetching more profiles", () => {
    mockUseFetchMoreProfiles.mockReturnValue({
      fetchedProfiles: initialProfiles,
      error: null,
      isLoading: true,
    });

    const { container } = render(<FeedList profiles={initialProfiles} />);

    expect(container.querySelector(".animate-spin")).toBeDefined();
  });

  it("shows an error message when fetching more profiles fails", () => {
    mockUseFetchMoreProfiles.mockReturnValue({
      fetchedProfiles: initialProfiles,
      error: new Error("Network error"),
      isLoading: false,
    });

    render(<FeedList profiles={initialProfiles} />);

    expect(screen.getByText("Network error")).toBeDefined();
  });
});
