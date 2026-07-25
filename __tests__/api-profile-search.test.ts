import { GET } from "@/app/api/profile/search/route";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockSearchProfiles, mockSearchCities } = vi.hoisted(() => ({
  mockSearchProfiles: vi.fn(),
  mockSearchCities: vi.fn(),
}));

vi.mock("@/lib/db/search", () => ({
  searchProfiles: mockSearchProfiles,
  searchCities: mockSearchCities,
}));

function makeRequest(query?: string) {
  const url = query
    ? `http://localhost/api/profile/search?query=${encodeURIComponent(query)}`
    : "http://localhost/api/profile/search";

  return new Request(url);
}

describe("GET /api/profile/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when query is missing", async () => {
    const res = await GET(makeRequest());

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "No query provided" });
    expect(mockSearchProfiles).not.toHaveBeenCalled();
    expect(mockSearchCities).not.toHaveBeenCalled();
  });

  it("returns cities and artists for a valid query", async () => {
    mockSearchProfiles.mockResolvedValue([
      { id: 1, profileName: "Neon Harbor" },
    ]);
    mockSearchCities.mockResolvedValue([
      { id: 2, city: "Austin", lat: 30.27, lon: -97.74 },
    ]);

    const res = await GET(makeRequest("au"));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      cities: [{ id: 2, city: "Austin", lat: 30.27, lon: -97.74 }],
      artists: [{ id: 1, profileName: "Neon Harbor" }],
    });
    expect(mockSearchProfiles).toHaveBeenCalledWith("au", 5);
    expect(mockSearchCities).toHaveBeenCalledWith("au", 5);
  });

  it("returns 500 when a search function throws", async () => {
    mockSearchProfiles.mockRejectedValue(new Error("db down"));
    mockSearchCities.mockResolvedValue([]);

    const res = await GET(makeRequest("au"));

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Internal server error" });
  });
});
