import ClipsPage from "@/app/clips/page";
import type { SongClipWithProfile } from "@/lib/db/types";
import { HAS_VISITED_COOKIE } from "@/lib/has-visited";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetSongClips = vi.fn();
const { mockCookieGet } = vi.hoisted(() => ({
  mockCookieGet: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
  })),
}));

vi.mock("@/lib/auth/clips", () => ({
  getSongClips: (...args: unknown[]) => mockGetSongClips(...args),
}));

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(async () => null),
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

vi.mock("@/components/feed-overlay", () => ({
  default: () => <div>Intro overlay</div>,
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
    mockCookieGet.mockReturnValue({ value: "true" });
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

  it("shows the intro overlay when the visit cookie is unset", async () => {
    mockCookieGet.mockReturnValue(undefined);

    const page = await ClipsPage({ searchParams: Promise.resolve({}) });
    render(page);

    expect(screen.getByText("Intro overlay")).toBeDefined();
    expect(mockCookieGet).toHaveBeenCalledWith(HAS_VISITED_COOKIE);
  });

  it("omits the intro overlay when the visit cookie is set", async () => {
    mockCookieGet.mockReturnValue({ value: "true" });

    const page = await ClipsPage({ searchParams: Promise.resolve({}) });
    render(page);

    expect(screen.queryByText("Intro overlay")).toBeNull();
  });
});
