import Search from "@/components/search";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

function mockSearchResponse({
  cities = [],
  artists = [],
  ok = true,
}: {
  cities?: Array<{ id: number; city: string; lat: number; lon: number }>;
  artists?: Array<{ id: number; profileName: string }>;
  ok?: boolean;
} = {}) {
  mockFetch.mockResolvedValue({
    ok,
    json: async () => ({ cities, artists }),
  });
}

async function typeSearchQuery(query: string) {
  fireEvent.change(screen.getByPlaceholderText("Search artists or locations"), {
    target: { value: query },
  });

  await act(async () => {
    await vi.advanceTimersByTimeAsync(300);
  });
  await act(async () => {
    await Promise.resolve();
  });
}

function getClearButton() {
  const buttons = screen.getAllByRole("button");
  return buttons[buttons.length - 1]!;
}

describe("Search", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", mockFetch);
    mockSearchResponse();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders the search input", () => {
    render(<Search />);

    expect(
      screen.getByPlaceholderText("Search artists or locations"),
    ).toBeDefined();
  });

  it("does not fetch until the query is longer than two characters", async () => {
    render(<Search />);

    fireEvent.change(screen.getByPlaceholderText("Search artists or locations"), {
      target: { value: "au" },
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("debounces fetch requests", async () => {
    render(<Search />);

    const input = screen.getByPlaceholderText("Search artists or locations");

    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.change(input, { target: { value: "au" } });
    fireEvent.change(input, { target: { value: "aus" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith("/api/profile/search?query=aus");
  });

  it("shows location and artist results", async () => {
    mockSearchResponse({
      cities: [{ id: 1, city: "Austin", lat: 30.27, lon: -97.74 }],
      artists: [{ id: 2, profileName: "Neon Harbor" }],
    });

    render(<Search />);
    await typeSearchQuery("aus");

    expect(screen.getByText("Locations")).toBeDefined();
    expect(screen.getByText("Artists")).toBeDefined();
    expect(screen.getByRole("link", { name: "Austin" })).toHaveProperty(
      "href",
      "http://localhost:3000/location?q=Austin&lat=30.27&lon=-97.74",
    );
    expect(screen.getByRole("link", { name: "Neon Harbor" })).toHaveProperty(
      "href",
      "http://localhost:3000/artist?q=Neon%20Harbor",
    );
  });

  it("deduplicates locations with the same city name", async () => {
    mockSearchResponse({
      cities: [
        { id: 1, city: "Austin", lat: 30.27, lon: -97.74 },
        { id: 2, city: "Austin", lat: 30.28, lon: -97.75 },
      ],
      artists: [],
    });

    render(<Search />);
    await typeSearchQuery("aus");

    expect(screen.getAllByRole("link", { name: "Austin" })).toHaveLength(1);
  });

  it('shows "No results found" when the search returns empty', async () => {
    mockSearchResponse({ cities: [], artists: [] });

    render(<Search />);
    await typeSearchQuery("zzz");

    expect(screen.getByText("No results found")).toBeDefined();
  });

  it("clears the query and results when the clear button is clicked", async () => {
    mockSearchResponse({
      cities: [{ id: 1, city: "Austin", lat: 30.27, lon: -97.74 }],
      artists: [],
    });

    render(<Search />);
    await typeSearchQuery("aus");

    expect(screen.getByText("Austin")).toBeDefined();

    fireEvent.click(getClearButton());

    expect(
      (screen.getByPlaceholderText("Search artists or locations") as HTMLInputElement)
        .value,
    ).toBe("");
    expect(screen.queryByText("Austin")).toBeNull();
  });

  it("clears results on blur", async () => {
    mockSearchResponse({
      cities: [{ id: 1, city: "Austin", lat: 30.27, lon: -97.74 }],
      artists: [],
    });

    render(<Search />);
    await typeSearchQuery("aus");

    expect(screen.getByText("Austin")).toBeDefined();

    fireEvent.blur(screen.getByPlaceholderText("Search artists or locations"));

    expect(
      (screen.getByPlaceholderText("Search artists or locations") as HTMLInputElement)
        .value,
    ).toBe("");
    expect(screen.queryByText("Austin")).toBeNull();
  });
});
