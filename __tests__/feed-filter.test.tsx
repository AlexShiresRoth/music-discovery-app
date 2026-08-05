import FeedFilter from "@/components/feed-filter";
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

  it("does not render outside /clips", () => {
    renderFilter("/");

    expect(screen.queryByRole("button", { name: /Filters/i })).toBeNull();
  });

  it("renders the filters toggle on /clips", () => {
    renderFilter();

    expect(screen.getByRole("button", { name: /Filters/i })).toBeDefined();
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

  it("shows a clear link that removes all genre filters", () => {
    renderFilter("/clips", "g=Rock&g=Jazz");
    openFilterPanel();

    const clearLink = screen.getByRole("link", { name: "Clear" });
    expect(clearLink).toBeDefined();
    expect(clearLink).toHaveProperty("href", "http://localhost:3000/clips?");
  });

  it("preserves non-genre params in the clear link", () => {
    renderFilter("/clips", "lat=30.27&lon=-97.74&q=Austin&g=Rock");
    openFilterPanel();

    expect(screen.getByRole("link", { name: "Clear" })).toHaveProperty(
      "href",
      "http://localhost:3000/clips?lat=30.27&lon=-97.74&q=Austin",
    );
  });

  it("does not show the clear link when no genres are selected", () => {
    renderFilter();
    openFilterPanel();

    expect(screen.queryByRole("link", { name: "Clear" })).toBeNull();
  });
});
