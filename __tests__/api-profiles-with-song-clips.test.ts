import { GET } from "@/app/api/profiles/with-song-clips/route";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockSelect,
  mockFrom,
  mockWhere,
  mockOrderBy,
  mockOffset,
  mockLimit,
  mockGetSongClipsByIds,
} = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockOrderBy: vi.fn(),
  mockOffset: vi.fn(),
  mockLimit: vi.fn(),
  mockGetSongClipsByIds: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: { select: mockSelect },
}));

vi.mock("@/lib/db/schema", () => ({
  profilesSchema: {
    genre: "genre",
    songClips: "songClips",
    location: "location",
    public: "public",
  },
}));

vi.mock("@/lib/db/song-clips", () => ({
  getSongClipsByIds: mockGetSongClipsByIds,
}));

vi.mock("drizzle-orm", () => ({
  inArray: vi.fn((column, values) => ({ column, values, type: "inArray" })),
  eq: vi.fn((column, value) => ({ column, value, type: "eq" })),
  and: vi.fn((...conditions) => ({ conditions, type: "and" })),
  asc: vi.fn((column) => ({ column, type: "asc" })),
  sql: vi.fn((strings, ...values) => ({ strings, values, type: "sql" })),
}));

const isPublicFilter = { column: "public", value: true, type: "eq" };

const profile = {
  id: 1,
  profileName: "Test Band",
  genre: "Rock",
  songClips: [{ id: "1", slot: 0 }],
};

function makeRequest(params: Record<string, string | string[]> = {}) {
  const url = new URL("http://localhost/api/profiles/with-song-clips");

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        url.searchParams.append(key, entry);
      }
      continue;
    }
    url.searchParams.set(key, value);
  }

  return new Request(url);
}

function setupDbChain() {
  mockSelect.mockReturnValue({ from: mockFrom });
  mockFrom.mockReturnValue({ where: mockWhere });
  mockWhere.mockReturnValue({ offset: mockOffset, orderBy: mockOrderBy });
  mockOrderBy.mockReturnValue({ offset: mockOffset });
  mockOffset.mockReturnValue({ limit: mockLimit });
}

describe("GET /api/profiles/with-song-clips", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDbChain();
    mockGetSongClipsByIds.mockResolvedValue([]);
  });

  it("returns paginated profiles filtered by genre", async () => {
    mockLimit.mockResolvedValue([profile]);

    const res = await GET(
      makeRequest({ start: "15", limit: "15", g: ["Rock", "Jazz"] }),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([
      { ...profile, songClips: [] },
    ]);
    expect(mockWhere).toHaveBeenCalledWith({
      conditions: [
        isPublicFilter,
        {
          column: "genre",
          values: ["Rock", "Jazz"],
          type: "inArray",
        },
        {
          strings: ["jsonb_array_length(", ") > 0"],
          values: ["songClips"],
          type: "sql",
        },
      ],
      type: "and",
    });
    expect(mockOffset).toHaveBeenCalledWith(15);
    expect(mockLimit).toHaveBeenCalledWith(15);
  });

  it("uses location-based pagination when lat and lon are provided", async () => {
    mockLimit.mockResolvedValue([profile]);

    const res = await GET(
      makeRequest({
        start: "0",
        limit: "15",
        lat: "30.27",
        lon: "-97.74",
        g: "Rock",
      }),
    );

    expect(res.status).toBe(200);
    expect(mockOrderBy).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalledWith({
      conditions: [
        isPublicFilter,
        { column: "genre", values: ["Rock"], type: "inArray" },
        expect.objectContaining({ type: "sql" }),
      ],
      type: "and",
    });
  });

  it("returns an empty array when there are no more profiles", async () => {
    mockLimit.mockResolvedValue([]);

    const res = await GET(makeRequest({ start: "30", limit: "15" }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([]);
    expect(mockGetSongClipsByIds).not.toHaveBeenCalled();
  });

  it("applies the public filter when no genres are provided", async () => {
    mockLimit.mockResolvedValue([profile]);

    await GET(makeRequest({ start: "0", limit: "15" }));

    expect(mockWhere).toHaveBeenCalledWith({
      conditions: [
        isPublicFilter,
        {
          strings: ["jsonb_array_length(", ") > 0"],
          values: ["songClips"],
          type: "sql",
        },
      ],
      type: "and",
    });
  });

  it("returns 500 when the database query fails", async () => {
    mockLimit.mockRejectedValue(new Error("db down"));

    const res = await GET(makeRequest({ start: "0", limit: "15" }));

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      error: "Internal Server Error",
    });
  });
});
