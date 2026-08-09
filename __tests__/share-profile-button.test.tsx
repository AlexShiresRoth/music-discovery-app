import ShareProfileButton from "@/app/profile/share-profile-button";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@vercel/analytics", () => ({
  track: vi.fn(),
}));

const profile = {
  id: "12",
  profileName: "Nora Vale",
  bio: "Indie folk from Brooklyn.",
};

describe("ShareProfileButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("location", {
      origin: "http://localhost:3000",
    });
  });

  it("shares the public profile URL via the Web Share API", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      share,
    });

    render(<ShareProfileButton profile={profile} />);
    fireEvent.click(screen.getByRole("button", { name: "Share Profile" }));

    await waitFor(() => {
      expect(share).toHaveBeenCalledWith({
        title: "Nora Vale",
        text: "Indie folk from Brooklyn.",
        url: "http://localhost:3000/profiles/12",
      });
    });
  });

  it("copies the public profile URL when native share is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const alert = vi.fn();
    vi.stubGlobal("navigator", {
      clipboard: { writeText },
    });
    vi.stubGlobal("alert", alert);

    render(<ShareProfileButton profile={profile} />);
    fireEvent.click(screen.getByRole("button", { name: "Share Profile" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        "http://localhost:3000/profiles/12",
      );
      expect(alert).toHaveBeenCalledWith("Link copied to clipboard!");
    });
  });
});
