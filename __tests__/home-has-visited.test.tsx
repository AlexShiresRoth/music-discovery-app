import Home from "@/app/page";
import { HAS_VISITED_COOKIE } from "@/lib/has-visited";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCookieGet, mockGetProfiles, mockGetTotalProfiles } = vi.hoisted(
  () => ({
    mockCookieGet: vi.fn(),
    mockGetProfiles: vi.fn(),
    mockGetTotalProfiles: vi.fn(),
  }),
);

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
  })),
}));

vi.mock("@/lib/auth", () => ({
  getProfilesWithSongClips: (...args: unknown[]) => mockGetProfiles(...args),
  getTotalProfilesWithSongClips: (...args: unknown[]) =>
    mockGetTotalProfiles(...args),
}));

vi.mock("@/components/feed-list", () => ({
  default: () => <div>Feed list</div>,
}));

vi.mock("@/components/feed-overlay", () => ({
  default: () => <header>Intro header</header>,
}));

describe("Home visit cookie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProfiles.mockResolvedValue([]);
    mockGetTotalProfiles.mockResolvedValue(0);
  });

  it("renders the intro when the visit cookie is unset", async () => {
    mockCookieGet.mockReturnValue(undefined);

    const ui = await Home({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.getByText("Intro header")).toBeDefined();
    expect(mockCookieGet).toHaveBeenCalledWith(HAS_VISITED_COOKIE);
  });

  it("omits the intro when the visit cookie is true", async () => {
    mockCookieGet.mockReturnValue({ value: "true" });

    const ui = await Home({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.queryByText("Intro header")).toBeNull();
    expect(screen.getByText("Feed list")).toBeDefined();
  });
});
