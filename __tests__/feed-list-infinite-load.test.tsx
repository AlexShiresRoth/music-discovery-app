import FeedList from "@/components/feed-list";
import type { ProfileWithSongClips } from "@/lib/db/types";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseSearchParams = vi.fn();
const mockUseFetchMoreData = vi.fn();
const mockOnFinish = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
  useRouter: () => ({ back: mockBack, push: vi.fn() }),
}));

vi.mock("@/lib/hooks/useFetchMoreData", () => ({
  useFetchMoreData: (...args: unknown[]) => mockUseFetchMoreData(...args),
}));

vi.mock("@/lib/hooks/intersectionobserver", () => ({
  useIntersectionObserver: vi.fn(),
}));

vi.mock("@/components/feed-profile", () => ({
  default: ({
    profile,
    currentIndex,
    advanceToNextProfile,
  }: {
    profile: ProfileWithSongClips;
    currentIndex: number;
    advanceToNextProfile: (index: number) => void;
  }) => (
    <div data-profile-slide data-profile-index={currentIndex}>
      <span>{profile.profileName}</span>
      <button
        type="button"
        aria-label={`Advance from ${profile.profileName}`}
        onClick={() => advanceToNextProfile(currentIndex + 1)}
      >
        Advance
      </button>
    </div>
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
  useFeedAudio: () => ({
    onFinish: mockOnFinish,
    isMuted: false,
    isPlaying: true,
    canPlay: true,
    toggleMute: vi.fn(),
    togglePlayPause: vi.fn(),
    setCanPlay: vi.fn(),
  }),
}));

const initialProfiles = [
  { id: 1, profileName: "Band One", songClips: [{ id: "1", slot: 0 }] },
  { id: 2, profileName: "Band Two", songClips: [{ id: "2", slot: 0 }] },
] as unknown as ProfileWithSongClips[];

describe("FeedList infinite load", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    mockUseFetchMoreData.mockReturnValue({
      fetchedData: initialProfiles,
      error: null,
      isLoading: false,
    });
  });

  it("passes url genres and coordinates into the fetch hook", () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams("g=Rock&g=Jazz&lat=30.27&lon=-97.74"),
    );

    render(<FeedList profiles={initialProfiles} />);

    expect(mockUseFetchMoreData).toHaveBeenCalledWith(
      expect.objectContaining({
        data: initialProfiles,
        limit: 2,
        baseUrl: "/api/profiles/with-song-clips",
        searchParams: {
          g: ["Rock", "Jazz"],
          lat: "30.27",
          lon: "-97.74",
        },
      }),
    );
  });

  it("renders fetched profiles from the hook", () => {
    mockUseFetchMoreData.mockReturnValue({
      fetchedData: [
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
    mockUseFetchMoreData.mockReturnValue({
      fetchedData: initialProfiles,
      error: null,
      isLoading: true,
    });

    const { container } = render(<FeedList profiles={initialProfiles} />);

    expect(container.querySelector(".animate-spin")).toBeDefined();
  });

  it("shows an error message when fetching more profiles fails", () => {
    mockUseFetchMoreData.mockReturnValue({
      fetchedData: initialProfiles,
      error: new Error("Network error"),
      isLoading: false,
    });

    render(<FeedList profiles={initialProfiles} />);

    expect(screen.getByText("Network error")).toBeDefined();
  });

  describe("empty state", () => {
    it("shows an empty state without mounting the feed audio UI", () => {
      render(<FeedList profiles={[]} searchTerm="Austin" />);

      expect(screen.getByText(/No Artists Yet/)).toBeDefined();
      expect(screen.getByText("Austin")).toBeDefined();
      expect(mockUseFetchMoreData).not.toHaveBeenCalled();
    });

    it("omits the for-clause when there is no search term or genre filter", () => {
      render(<FeedList profiles={[]} />);

      expect(
        screen.getByText(
          (_, node) => node?.textContent === "No Artists Yet. Be the first.",
        ),
      ).toBeDefined();
      expect(screen.queryByText(/ for /)).toBeNull();
    });

    it("goes back when the empty-state button is clicked", () => {
      render(<FeedList profiles={[]} searchTerm="Austin" />);

      fireEvent.click(screen.getByRole("button", { name: "Go Back" }));
      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe("continuous play", () => {
    it("scrolls to the next profile when advancing within the feed", () => {
      const scrollIntoView = vi.fn();
      HTMLElement.prototype.scrollIntoView = scrollIntoView;

      render(<FeedList profiles={initialProfiles} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Advance from Band One" }),
      );

      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        inline: "start",
      });
      expect(mockOnFinish).not.toHaveBeenCalled();
    });

    it("calls feed audio onFinish when advancing past the last profile", () => {
      const scrollIntoView = vi.fn();
      HTMLElement.prototype.scrollIntoView = scrollIntoView;

      render(<FeedList profiles={initialProfiles} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Advance from Band Two" }),
      );

      expect(mockOnFinish).toHaveBeenCalled();
      expect(scrollIntoView).not.toHaveBeenCalled();
    });
  });
});
