import FeedFilter from "@/components/feed-filter";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUsePathname = vi.fn();
const mockUseSearchParams = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

function renderFilter(params = "") {
  mockUsePathname.mockReturnValue("/");
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

  it("renders the filters toggle", () => {
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
    renderFilter("g=Rock&g=Jazz");
    openFilterPanel();

    expect(screen.getByText("2")).toBeDefined();
  });

  it("highlights selected genres", () => {
    renderFilter("g=Rock");
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
      "http://localhost:3000/?g=Rock",
    );
  });

  it("removes a genre from the query string when toggled off", () => {
    renderFilter("g=Rock&g=Jazz");
    openFilterPanel();

    expect(screen.getByRole("link", { name: "Rock" })).toHaveProperty(
      "href",
      "http://localhost:3000/?g=Jazz",
    );
  });

  it("preserves location and search params when toggling genres", () => {
    renderFilter("lat=30.27&lon=-97.74&q=Austin");
    openFilterPanel();

    expect(screen.getByRole("link", { name: "Rock" })).toHaveProperty(
      "href",
      "http://localhost:3000/?lat=30.27&lon=-97.74&q=Austin&g=Rock",
    );
  });

  it("shows a clear link that removes all genre filters", () => {
    renderFilter("g=Rock&g=Jazz");
    openFilterPanel();

    const clearLink = screen.getByRole("link", { name: "Clear" });
    expect(clearLink).toBeDefined();
    expect(clearLink).toHaveProperty("href", "http://localhost:3000/?");
  });

  it("preserves non-genre params in the clear link", () => {
    renderFilter("lat=30.27&lon=-97.74&q=Austin&g=Rock");
    openFilterPanel();

    expect(screen.getByRole("link", { name: "Clear" })).toHaveProperty(
      "href",
      "http://localhost:3000/?lat=30.27&lon=-97.74&q=Austin",
    );
  });

  it("does not show the clear link when no genres are selected", () => {
    renderFilter();
    openFilterPanel();

    expect(screen.queryByRole("link", { name: "Clear" })).toBeNull();
  });
});
