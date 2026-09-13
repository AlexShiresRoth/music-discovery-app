import FeedFilter from "@/components/feed-filter";
import { PROFILE_STATUS_FILTERS } from "@/constants";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUsePathname = vi.fn();
const mockUseSearchParams = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

function renderFilter(pathname = "/clips", params = "") {
  mockUsePathname.mockReturnValue(pathname);
  mockUseSearchParams.mockReturnValue(new URLSearchParams(params));
  return render(<FeedFilter />);
}

function openFilterPanel() {
  fireEvent.click(screen.getByRole("button", { name: /Filters/i }));
}

describe("FeedFilter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render outside allowed feed paths", () => {
    renderFilter("/profile");

    expect(screen.queryByRole("button", { name: /Filters/i })).toBeNull();
  });

  it("renders the filters toggle on /clips", () => {
    renderFilter();

    expect(screen.getByRole("button", { name: /Filters/i })).toBeDefined();
  });

  it("renders status filters on the home feed", () => {
    renderFilter("/");
    openFilterPanel();

    expect(screen.getByText("Status")).toBeDefined();
    expect(
      screen.getByRole("link", {
        name: PROFILE_STATUS_FILTERS.openToCollaboration.label,
      }),
    ).toBeDefined();
    expect(screen.queryByText("Genre")).toBeNull();
  });

  it("renders status filters on the location feed without genres", () => {
    renderFilter("/location", "lat=30.27&lon=-97.74&q=Austin");
    openFilterPanel();

    expect(screen.getByText("Status")).toBeDefined();
    expect(
      screen.getByRole("link", {
        name: PROFILE_STATUS_FILTERS.openToGigs.label,
      }),
    ).toBeDefined();
    expect(screen.queryByText("Genre")).toBeNull();
  });

  it("does not render status filters on the clips feed", () => {
    renderFilter("/clips");
    openFilterPanel();

    expect(screen.getByText("Genre")).toBeDefined();
    expect(screen.queryByText("Status")).toBeNull();
  });

  it("opens the genre filter panel when clicked", () => {
    renderFilter();
    openFilterPanel();

    expect(screen.getByText("Genre")).toBeDefined();
    expect(screen.getByRole("link", { name: "Rock" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Jazz" })).toBeDefined();
  });

  it("shows a badge with the number of active genre filters", () => {
    renderFilter("/clips", "g=Rock&g=Jazz");
    openFilterPanel();

    expect(screen.getByText("2")).toBeDefined();
  });

  it("shows a badge for active status filters", () => {
    renderFilter(
      "/",
      `status=${PROFILE_STATUS_FILTERS.openToCollaboration.value}&status=${PROFILE_STATUS_FILTERS.openToGigs.value}`,
    );

    expect(screen.getByText("2")).toBeDefined();
  });

  it("highlights selected genres", () => {
    renderFilter("/clips", "g=Rock");
    openFilterPanel();

    expect(
      screen.getByRole("link", { name: "Rock" }).classList.contains(
        "bg-amber-500/50",
      ),
    ).toBe(true);
    expect(
      screen.getByRole("link", { name: "Jazz" }).classList.contains(
        "bg-amber-500/50",
      ),
    ).toBe(false);
  });

  it("adds a genre to the query string when toggled on", () => {
    renderFilter();
    openFilterPanel();

    expect(screen.getByRole("link", { name: "Rock" })).toHaveProperty(
      "href",
      "http://localhost:3000/clips?g=Rock",
    );
  });

  it("removes a genre from the query string when toggled off", () => {
    renderFilter("/clips", "g=Rock&g=Jazz");
    openFilterPanel();

    expect(screen.getByRole("link", { name: "Rock" })).toHaveProperty(
      "href",
      "http://localhost:3000/clips?g=Jazz",
    );
  });

  it("preserves location and search params when toggling genres", () => {
    renderFilter("/clips", "lat=30.27&lon=-97.74&q=Austin");
    openFilterPanel();

    expect(screen.getByRole("link", { name: "Rock" })).toHaveProperty(
      "href",
      "http://localhost:3000/clips?lat=30.27&lon=-97.74&q=Austin&g=Rock",
    );
  });

  it("toggles status filters without mixing them into genre params", () => {
    renderFilter("/", `status=${PROFILE_STATUS_FILTERS.openToGigs.value}`);
    openFilterPanel();

    expect(
      screen.getByRole("link", {
        name: PROFILE_STATUS_FILTERS.openToCollaboration.label,
      }),
    ).toHaveProperty(
      "href",
      `http://localhost:3000/?status=${PROFILE_STATUS_FILTERS.openToGigs.value}&status=${PROFILE_STATUS_FILTERS.openToCollaboration.value}`,
    );
  });

  it("removes a status filter when toggled off", () => {
    renderFilter(
      "/",
      `status=${PROFILE_STATUS_FILTERS.openToGigs.value}&status=${PROFILE_STATUS_FILTERS.openToCollaboration.value}`,
    );
    openFilterPanel();

    expect(
      screen.getByRole("link", {
        name: PROFILE_STATUS_FILTERS.openToGigs.label,
      }),
    ).toHaveProperty(
      "href",
      `http://localhost:3000/?status=${PROFILE_STATUS_FILTERS.openToCollaboration.value}`,
    );
  });

  it("preserves location params when toggling status on /location", () => {
    renderFilter(
      "/location",
      `lat=30.27&lon=-97.74&q=Austin&status=${PROFILE_STATUS_FILTERS.openToGigs.value}`,
    );
    openFilterPanel();

    expect(
      screen.getByRole("link", {
        name: PROFILE_STATUS_FILTERS.openToCollaboration.label,
      }),
    ).toHaveProperty(
      "href",
      `http://localhost:3000/location?lat=30.27&lon=-97.74&q=Austin&status=${PROFILE_STATUS_FILTERS.openToGigs.value}&status=${PROFILE_STATUS_FILTERS.openToCollaboration.value}`,
    );
  });

  it("shows a clear link that removes all genre filters", () => {
    renderFilter("/clips", "g=Rock&g=Jazz");
    openFilterPanel();

    const clearLink = screen.getByRole("link", { name: "Clear" });
    expect(clearLink).toBeDefined();
    expect(clearLink).toHaveProperty("href", "http://localhost:3000/clips?");
  });

  it("shows a clear link that removes status filters", () => {
    renderFilter("/", `status=${PROFILE_STATUS_FILTERS.openToGigs.value}`);
    openFilterPanel();

    expect(screen.getByRole("link", { name: "Clear" })).toHaveProperty(
      "href",
      "http://localhost:3000/?",
    );
  });

  it("preserves non-genre params in the clear link", () => {
    renderFilter("/clips", "lat=30.27&lon=-97.74&q=Austin&g=Rock");
    openFilterPanel();

    expect(screen.getByRole("link", { name: "Clear" })).toHaveProperty(
      "href",
      "http://localhost:3000/clips?lat=30.27&lon=-97.74&q=Austin",
    );
  });

  it("does not show the clear link when no filters are selected", () => {
    renderFilter();
    openFilterPanel();

    expect(screen.queryByRole("link", { name: "Clear" })).toBeNull();
  });
});
