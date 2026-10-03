import ClipClient from "@/app/clips/[id]/clip-client";
import { FeedAudioContext } from "@/context/feed-audio";
import type { SongClipWithProfile } from "@/lib/db/types";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/clip-feed-display", () => ({
  default: ({
    clip,
    index,
    isActive,
    onFinish,
  }: {
    clip: SongClipWithProfile;
    index: number;
    isActive: boolean;
    onFinish: () => void;
  }) => (
    <div
      data-testid="clip-feed-display"
      data-index={index}
      data-active={isActive ? "true" : "false"}
    >
      <span>{clip.title}</span>
      <button type="button" onClick={onFinish}>
        Finish
      </button>
    </div>
  ),
}));

const clip = {
  id: 7,
  title: "Night Drive",
  profileName: "Neon Harbor",
} as SongClipWithProfile;

describe("ClipClient", () => {
  it("renders the clip as the single active slide wired to the feed audio onFinish", () => {
    const onFinish = vi.fn();
    const contextValue = { onFinish } as unknown as React.ContextType<
      typeof FeedAudioContext
    >;

    render(
      <FeedAudioContext.Provider value={contextValue}>
        <ClipClient clip={clip} />
      </FeedAudioContext.Provider>,
    );

    const display = screen.getByTestId("clip-feed-display");
    expect(display.getAttribute("data-index")).toBe("0");
    expect(display.getAttribute("data-active")).toBe("true");
    expect(screen.getByText("Night Drive")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
