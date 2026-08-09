import IntroOverlay from "@/components/feed-overlay";
import { HAS_VISITED_COOKIE } from "@/lib/has-visited";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockPush, mockRefresh, mockGetCurrentPosition } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
  mockGetCurrentPosition: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

function clearCookies() {
  for (const row of document.cookie.split(";")) {
    const name = row.split("=")[0]?.trim();
    if (!name) continue;
    document.cookie = `${name}=; max-age=0; path=/`;
  }
}

describe("IntroOverlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCookies();
    vi.stubGlobal("navigator", {
      ...navigator,
      geolocation: {
        getCurrentPosition: mockGetCurrentPosition,
      },
    });
  });

  afterEach(() => {
    clearCookies();
    vi.unstubAllGlobals();
  });

  it("renders the intro header and CTAs", () => {
    render(<IntroOverlay />);

    expect(
      screen.getByRole("heading", {
        name: "Discover music the algorithms missed.",
      }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Explore Nearby" }),
    ).toBeDefined();
    expect(
      screen.getByRole("link", { name: "Share Your Music" }),
    ).toHaveProperty("href", "http://localhost:3000/profile/create");
  });

  it("sets the visit cookie when Share Your Music is clicked", () => {
    render(<IntroOverlay />);

    fireEvent.click(screen.getByRole("link", { name: "Share Your Music" }));

    expect(document.cookie).toContain(`${HAS_VISITED_COOKIE}=true`);
  });

  it("sets the visit cookie, navigates, and refreshes on Explore Nearby", () => {
    mockGetCurrentPosition.mockImplementation((success) => {
      success({
        coords: { latitude: 40.7, longitude: -74.0 },
      });
    });

    render(<IntroOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "Explore Nearby" }));

    expect(document.cookie).toContain(`${HAS_VISITED_COOKIE}=true`);
    expect(mockPush).toHaveBeenCalledWith("/location?lat=40.7&lon=-74");
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});
