import ShareButton from "@/components/share-button";
import { track } from "@vercel/analytics";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@vercel/analytics", () => ({
  track: vi.fn(),
}));

const props = {
  shareUrl: "/clips/7",
  shareTitle: "Night Drive",
  shareText: "Night Drive by Neon Harbor",
  canShareTrackEvent: {
    name: "share_clip",
    payload: { clip_id: "7", artist_id: "3" },
  },
  clipboardShareTrackEvent: {
    name: "share_clip_clipboard",
    payload: { clip_id: "7", artist_id: "3" },
  },
  shareButtonText: "Share Clip",
};

describe("ShareButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the provided button text", () => {
    vi.stubGlobal("navigator", {});

    render(<ShareButton {...props} />);

    expect(screen.getByRole("button", { name: "Share Clip" })).toBeDefined();
  });

  it("shares via the Web Share API and tracks the native share event", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share });

    render(<ShareButton {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Share Clip" }));

    await waitFor(() => {
      expect(share).toHaveBeenCalledWith({
        title: "Night Drive",
        text: "Night Drive by Neon Harbor",
        url: "/clips/7",
      });
    });
    expect(track).toHaveBeenCalledWith("share_clip", {
      clip_id: "7",
      artist_id: "3",
    });
    expect(track).not.toHaveBeenCalledWith(
      "share_clip_clipboard",
      expect.anything(),
    );
  });

  it("copies the share URL and tracks the clipboard event when native share is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const alert = vi.fn();
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    vi.stubGlobal("alert", alert);

    render(<ShareButton {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Share Clip" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("/clips/7");
      expect(alert).toHaveBeenCalledWith("Link copied to clipboard!");
    });
    expect(track).toHaveBeenCalledWith("share_clip_clipboard", {
      clip_id: "7",
      artist_id: "3",
    });
  });

  it("swallows errors when the user aborts the native share", async () => {
    const share = vi.fn().mockRejectedValue(new Error("AbortError"));
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.stubGlobal("navigator", { share });

    render(<ShareButton {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Share Clip" }));

    await waitFor(() => {
      expect(info).toHaveBeenCalledWith("Player aborted share");
    });
    info.mockRestore();
  });
});
