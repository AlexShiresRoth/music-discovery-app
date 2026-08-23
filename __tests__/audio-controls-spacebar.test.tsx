import FeedAudioControls from "@/components/audio-controls";
import { FeedAudioContext } from "@/context/feed-audio";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockRefresh, mockTogglePlayPause } = vi.hoisted(() => ({
  mockRefresh: vi.fn(),
  mockTogglePlayPause: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: vi.fn(),
  }),
}));

vi.mock("@/stores/use-has-visited", () => ({
  useHasVisited: () => true,
}));

function renderControls({
  canPlay = true,
  isPlaying = false,
}: {
  canPlay?: boolean;
  isPlaying?: boolean;
} = {}) {
  return render(
    <FeedAudioContext.Provider
      value={{
        isMuted: false,
        toggleMute: vi.fn(),
        isPlaying,
        togglePlayPause: mockTogglePlayPause,
        canPlay,
        setCanPlay: vi.fn(),
        onFinish: vi.fn(),
      }}
    >
      <FeedAudioControls />
    </FeedAudioContext.Provider>,
  );
}

describe("FeedAudioControls spacebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Ensure listeners from prior renders are cleaned up between tests.
  });

  it("toggles play/pause when Space is pressed", () => {
    renderControls();

    fireEvent.keyDown(document.body, { key: " " });

    expect(mockTogglePlayPause).toHaveBeenCalledTimes(1);
  });

  it("ignores repeated Space keydown events while held", () => {
    renderControls();

    fireEvent.keyDown(document.body, { key: " ", repeat: true });

    expect(mockTogglePlayPause).not.toHaveBeenCalled();
  });

  it("does not toggle when playback is not ready", () => {
    renderControls({ canPlay: false });

    fireEvent.keyDown(document.body, { key: " " });

    expect(mockTogglePlayPause).not.toHaveBeenCalled();
  });

  it("does not toggle Space when typing in an input", () => {
    renderControls();
    const input = document.createElement("input");
    document.body.appendChild(input);

    fireEvent.keyDown(input, { key: " " });

    expect(mockTogglePlayPause).not.toHaveBeenCalled();
    input.remove();
  });

  it("does not stack listeners across play-state updates", () => {
    const { rerender } = render(
      <FeedAudioContext.Provider
        value={{
          isMuted: false,
          toggleMute: vi.fn(),
          isPlaying: false,
          togglePlayPause: mockTogglePlayPause,
          canPlay: true,
          setCanPlay: vi.fn(),
          onFinish: vi.fn(),
        }}
      >
        <FeedAudioControls />
      </FeedAudioContext.Provider>,
    );

    rerender(
      <FeedAudioContext.Provider
        value={{
          isMuted: false,
          toggleMute: vi.fn(),
          isPlaying: true,
          togglePlayPause: mockTogglePlayPause,
          canPlay: true,
          setCanPlay: vi.fn(),
          onFinish: vi.fn(),
        }}
      >
        <FeedAudioControls />
      </FeedAudioContext.Provider>,
    );

    fireEvent.keyDown(document.body, { key: " " });

    expect(mockTogglePlayPause).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Pause clips" })).toBeDefined();
  });
});
