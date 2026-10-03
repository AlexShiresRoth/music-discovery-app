import ClipPage from "@/app/clips/[id]/page";
import type { SongClipWithProfile } from "@/lib/db/types";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetSongClipsByIds, mockGetProfileById } = vi.hoisted(() => ({
  mockGetSongClipsByIds: vi.fn(),
  mockGetProfileById: vi.fn(),
}));

vi.mock("@/lib/db/song-clips", () => ({
  getSongClipsByIds: (...args: unknown[]) => mockGetSongClipsByIds(...args),
}));

vi.mock("@/lib/auth", () => ({
  getProfileById: (...args: unknown[]) => mockGetProfileById(...args),
}));

vi.mock("@/context/feed-audio", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="feed-audio-provider">{children}</div>
  ),
}));

vi.mock("@/components/audio-controls", () => ({
  default: () => <div>Audio controls</div>,
}));

vi.mock("@/app/clips/[id]/clip-client", () => ({
  default: ({ clip }: { clip: SongClipWithProfile }) => (
    <div data-testid="clip-client">
      <span>{clip.title}</span>
      <span>{clip.profileName}</span>
      <span data-testid="profile-id">{clip.profileId}</span>
      <span data-testid="profile-image">{clip.profileImage}</span>
    </div>
  ),
}));

const clip = {
  id: 7,
  title: "Night Drive",
  profileRefId: 3,
};

const profile = {
  id: 3,
  profileName: "Neon Harbor",
  imageUrl: "https://example.com/neon.jpg",
};

function renderPage(id = "7") {
  return ClipPage({ params: Promise.resolve({ id }) }).then(render);
}

describe("ClipPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSongClipsByIds.mockResolvedValue([clip]);
    mockGetProfileById.mockResolvedValue(profile);
  });

  it("loads the clip and its profile, then renders the clip with audio controls", async () => {
    await renderPage();

    expect(mockGetSongClipsByIds).toHaveBeenCalledWith(["7"]);
    expect(mockGetProfileById).toHaveBeenCalledWith(3);
    expect(screen.getByTestId("feed-audio-provider")).toBeDefined();
    expect(screen.getByText("Night Drive")).toBeDefined();
    expect(screen.getByText("Neon Harbor")).toBeDefined();
    expect(screen.getByTestId("profile-id").textContent).toBe("3");
    expect(screen.getByTestId("profile-image").textContent).toBe(
      "https://example.com/neon.jpg",
    );
    expect(screen.getByText("Audio controls")).toBeDefined();
  });

  it("falls back to empty strings when the profile has no name or image", async () => {
    mockGetProfileById.mockResolvedValue({
      id: 3,
      profileName: null,
      imageUrl: null,
    });

    await renderPage();

    expect(screen.getByTestId("profile-image").textContent).toBe("");
    expect(screen.getByTestId("clip-client")).toBeDefined();
  });

  it("shows a not found message when the clip does not exist", async () => {
    mockGetSongClipsByIds.mockResolvedValue([]);

    await renderPage("999");

    expect(screen.getByText("Clip not found")).toBeDefined();
    expect(mockGetProfileById).not.toHaveBeenCalled();
    expect(screen.queryByTestId("clip-client")).toBeNull();
  });

  it("shows a not found message when the clip's profile does not exist", async () => {
    mockGetProfileById.mockResolvedValue(null);

    await renderPage();

    expect(screen.getByText("Profile not found")).toBeDefined();
    expect(screen.queryByTestId("clip-client")).toBeNull();
  });
});
