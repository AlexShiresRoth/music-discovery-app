import { GET } from "@/app/api/clips/with-profiles/route";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockSelect,
  mockFrom,
  mockWhere,
  mockOrderBy,
  mockOffset,
  mockLimit,
} = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockOrderBy: vi.fn(),
  mockOffset: vi.fn(),
  mockLimit: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: { select: mockSelect },
}));

vi.mock("@/lib/db/schema", () => ({
  songClipsSchema: {
    genre: "genre",
    updatedAt: "updatedAt",
    profileRefId: "profileRefId",
  },
  profilesSchema: {
    id: "id",
    public: "public",
  },
}));

vi.mock("drizzle-orm", () => ({
  inArray: vi.fn((column, values) => ({ column, values, type: "inArray" })),
  eq: vi.fn((column, value) => ({ column, value, type: "eq" })),
  and: vi.fn((...conditions) => ({ conditions, type: "and" })),
  desc: vi.fn((column) => ({ column, type: "desc" })),
}));

const clip = {
  id: 1,
  slot: 0,
  title: "Night Drive",
  db_url: "https://example.com/clip.wav",
  full_song_url: "https://example.com/full",
  genre: "Electronic",
  profileRefId: 42,
};

const profile = {
  id: 42,
  profileName: "Neon Harbor",
  imageUrl: "https://example.com/avatar.jpg",
};

function makeRequest(params: Record<string, string | string[]> = {}) {
  const url = new URL("http://localhost/api/clips/with-profiles");

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

function setupDbChain(clips = [clip], profiles = [profile]) {
  let selectCall = 0;
  mockSelect.mockImplementation(() => {
    selectCall += 1;
    if (selectCall === 1) {
      return { from: mockFrom };
    }
    // profile lookup(s)
    return {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(profiles),
      }),
    };
  });
  mockFrom.mockReturnValue({ where: mockWhere });
  mockWhere.mockReturnValue({ orderBy: mockOrderBy });
  mockOrderBy.mockReturnValue({ offset: mockOffset });
  mockOffset.mockReturnValue({ limit: mockLimit });
  mockLimit.mockResolvedValue(clips);
}

describe("GET /api/clips/with-profiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDbChain();
  });

  it("returns paginated clips with profile fields", async () => {
    const res = await GET(makeRequest({ start: "0", limit: "15" }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([
      {
        ...clip,
        profileId: 42,
        profileName: "Neon Harbor",
        profileImage: "https://example.com/avatar.jpg",
      },
    ]);
    expect(mockOffset).toHaveBeenCalledWith(0);
    expect(mockLimit).toHaveBeenCalledWith(15);
    expect(mockWhere).toHaveBeenCalledWith(undefined);
  });

  it("filters by genre query params", async () => {
    const res = await GET(
      makeRequest({ start: "15", limit: "10", g: ["Rock", "Jazz"] }),
    );

    expect(res.status).toBe(200);
    expect(mockWhere).toHaveBeenCalledWith({
      column: "genre",
      values: ["Rock", "Jazz"],
      type: "inArray",
    });
    expect(mockOffset).toHaveBeenCalledWith(15);
    expect(mockLimit).toHaveBeenCalledWith(10);
  });

  it("returns 500 when the query throws", async () => {
    mockLimit.mockRejectedValue(new Error("db down"));

    const res = await GET(makeRequest());

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      error: "Internal Server Error",
    });
  });

  it("omits clips when the related profile is not public", async () => {
    setupDbChain([clip], []);

    const res = await GET(makeRequest({ start: "0", limit: "15" }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([]);
  });
});
