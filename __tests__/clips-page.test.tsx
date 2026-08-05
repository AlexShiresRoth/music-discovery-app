import ClipsPage from "@/app/clips/page";
import type { SongClipWithProfile } from "@/lib/db/types";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetSongClips = vi.fn();

vi.mock("@/lib/auth/clips", () => ({
  getSongClips: (...args: unknown[]) => mockGetSongClips(...args),
}));

vi.mock("@/components/feed-list", () => ({
  default: ({ songClips }: { songClips: SongClipWithProfile[] }) => (
    <div>
      <span>Clips feed</span>
      {songClips.map((clip) => (
        <span key={clip.id}>{clip.title}</span>
      ))}
    </div>
  ),
}));

const clip = {
  id: 1,
  title: "Night Drive",
  profileName: "Neon Harbor",
} as SongClipWithProfile;

describe("ClipsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSongClips.mockResolvedValue([clip]);
  });

  it("loads clips without a genre filter", async () => {
    const page = await ClipsPage({ searchParams: Promise.resolve({}) });
    render(page);

    expect(mockGetSongClips).toHaveBeenCalledWith(undefined);
    expect(screen.getByText("Clips feed")).toBeDefined();
    expect(screen.getByText("Night Drive")).toBeDefined();
  });

  it("passes a single genre string as an array", async () => {
    await ClipsPage({ searchParams: Promise.resolve({ g: "Rock" }) });

    expect(mockGetSongClips).toHaveBeenCalledWith(["Rock"]);
  });

  it("passes multiple genres through", async () => {
    await ClipsPage({
      searchParams: Promise.resolve({ g: ["Rock", "Jazz"] }),
    });

    expect(mockGetSongClips).toHaveBeenCalledWith(["Rock", "Jazz"]);
  });

  it("renders an empty feed list when no clips are returned", async () => {
    mockGetSongClips.mockResolvedValue([]);

    const page = await ClipsPage({ searchParams: Promise.resolve({}) });
    render(page);

    expect(screen.getByText("Clips feed")).toBeDefined();
    expect(screen.queryByText("Night Drive")).toBeNull();
  });
});
