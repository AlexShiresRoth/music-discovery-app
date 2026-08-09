import FeedAudioControls from "@/components/audio-controls";
import { FeedAudioContext } from "@/context/feed-audio";
import { HAS_VISITED_COOKIE } from "@/lib/has-visited";
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

function clearCookies() {
  for (const row of document.cookie.split(";")) {
    const name = row.split("=")[0]?.trim();
    if (!name) continue;
    document.cookie = `${name}=; max-age=0; path=/`;
  }
}

function renderControls() {
  return render(
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
}

describe("FeedAudioControls visit tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCookies();
  });

  afterEach(() => {
    clearCookies();
  });

  it("shows the first-visit hint when the cookie is unset", () => {
    const { container } = renderControls();
    expect(container.querySelector(".animate-grow-width-delay")).not.toBeNull();
  });

  it("hides the first-visit hint when the cookie is already set", () => {
    document.cookie = `${HAS_VISITED_COOKIE}=true; path=/`;
    const { container } = renderControls();
    expect(container.querySelector(".animate-grow-width-delay")).toBeNull();
  });

  it("sets the visit cookie and refreshes on first play", () => {
    renderControls();

    fireEvent.click(screen.getByRole("button", { name: "Play clips" }));

    expect(mockTogglePlayPause).toHaveBeenCalledTimes(1);
    expect(document.cookie).toContain(`${HAS_VISITED_COOKIE}=true`);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("does not refresh again when already visited", () => {
    document.cookie = `${HAS_VISITED_COOKIE}=true; path=/`;
    renderControls();

    fireEvent.click(screen.getByRole("button", { name: "Play clips" }));

    expect(mockTogglePlayPause).toHaveBeenCalledTimes(1);
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
