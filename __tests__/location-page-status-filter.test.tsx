import LocationPage from "@/app/location/page";
import { PROFILE_STATUS_FILTERS } from "@/constants";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetProfilesByLocation,
  mockGetTotalByLocation,
  mockGetSession,
} = vi.hoisted(() => ({
  mockGetProfilesByLocation: vi.fn(),
  mockGetTotalByLocation: vi.fn(),
  mockGetSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
  getProfilesWithSongClipsByLocation: (...args: unknown[]) =>
    mockGetProfilesByLocation(...args),
  getTotalProfilesWithSongClipsByLocation: (...args: unknown[]) =>
    mockGetTotalByLocation(...args),
}));

vi.mock("@/components/feed-list", () => ({
  default: ({ searchTerm }: { searchTerm?: string }) => (
    <div>{searchTerm ? `Feed near ${searchTerm}` : "Feed nearby"}</div>
  ),
}));

vi.mock("@/components/breadcrumbs", () => ({
  default: () => <button type="button">Back</button>,
}));

const { needActForShow, openToGigs } = PROFILE_STATUS_FILTERS;

describe("LocationPage status filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProfilesByLocation.mockResolvedValue([]);
    mockGetTotalByLocation.mockResolvedValue(0);
    mockGetSession.mockResolvedValue(null);
  });

  it("passes status filters into location list and total helpers", async () => {
    const ui = await LocationPage({
      searchParams: Promise.resolve({
        lat: "30.27",
        lon: "-97.74",
        q: "Austin",
        status: [openToGigs.value, needActForShow.value],
      }),
    });
    render(ui);

    expect(mockGetProfilesByLocation).toHaveBeenCalledWith(
      -97.74,
      30.27,
      [openToGigs.value, needActForShow.value],
    );
    expect(mockGetTotalByLocation).toHaveBeenCalledWith(-97.74, 30.27, [
      openToGigs.value,
      needActForShow.value,
    ]);
    expect(screen.getByText("Feed near Austin")).toBeDefined();
  });

  it("normalizes a single status string and defaults missing status to []", async () => {
    await LocationPage({
      searchParams: Promise.resolve({
        lat: "30.27",
        lon: "-97.74",
        status: needActForShow.value,
      }),
    });

    expect(mockGetProfilesByLocation).toHaveBeenCalledWith(
      -97.74,
      30.27,
      [needActForShow.value],
    );

    vi.clearAllMocks();
    mockGetProfilesByLocation.mockResolvedValue([]);
    mockGetTotalByLocation.mockResolvedValue(0);

    await LocationPage({
      searchParams: Promise.resolve({
        lat: "30.27",
        lon: "-97.74",
      }),
    });

    expect(mockGetProfilesByLocation).toHaveBeenCalledWith(-97.74, 30.27, []);
    expect(mockGetTotalByLocation).toHaveBeenCalledWith(-97.74, 30.27, []);
  });
});
