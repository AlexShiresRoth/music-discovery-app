import Home from "@/app/page";
import { PROFILE_STATUS_FILTERS } from "@/constants";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCookieGet,
  mockGetProfiles,
  mockGetTotalProfiles,
  mockGetSession,
} = vi.hoisted(() => ({
  mockCookieGet: vi.fn(),
  mockGetProfiles: vi.fn(),
  mockGetTotalProfiles: vi.fn(),
  mockGetSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
  })),
}));

vi.mock("@/lib/auth", () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
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

const { openToCollaboration, openToGigs } = PROFILE_STATUS_FILTERS;

describe("Home status filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieGet.mockReturnValue({ value: "true" });
    mockGetProfiles.mockResolvedValue([]);
    mockGetTotalProfiles.mockResolvedValue(0);
    mockGetSession.mockResolvedValue(null);
  });

  it("passes a single status search param into list and total helpers", async () => {
    const ui = await Home({
      searchParams: Promise.resolve({ status: openToCollaboration.value }),
    });
    render(ui);

    expect(mockGetProfiles).toHaveBeenCalledWith(0, 15, [
      openToCollaboration.value,
    ]);
    expect(mockGetTotalProfiles).toHaveBeenCalledWith([
      openToCollaboration.value,
    ]);
    expect(screen.getByText("Feed list")).toBeDefined();
  });

  it("passes an array of status search params into list and total helpers", async () => {
    await Home({
      searchParams: Promise.resolve({
        status: [openToCollaboration.value, openToGigs.value],
      }),
    });

    expect(mockGetProfiles).toHaveBeenCalledWith(0, 15, [
      openToCollaboration.value,
      openToGigs.value,
    ]);
    expect(mockGetTotalProfiles).toHaveBeenCalledWith([
      openToCollaboration.value,
      openToGigs.value,
    ]);
  });

  it("passes an empty status list when none are provided", async () => {
    await Home({ searchParams: Promise.resolve({}) });

    expect(mockGetProfiles).toHaveBeenCalledWith(0, 15, []);
    expect(mockGetTotalProfiles).toHaveBeenCalledWith([]);
  });
});
