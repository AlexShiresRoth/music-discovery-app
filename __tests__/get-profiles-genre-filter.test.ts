import { getProfilesWithSongClips } from "@/lib/auth/profile";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockSelect,
  mockFrom,
  mockWhere,
  mockOrderBy,
  mockOffset,
  mockLimit,
  mockDesc,
} = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockOrderBy: vi.fn(),
  mockOffset: vi.fn(),
  mockLimit: vi.fn(),
  mockDesc: vi.fn((column) => ({ column, direction: "desc" })),
}));

vi.mock("@/lib/db", () => ({
  db: { select: mockSelect },
}));

vi.mock("@/lib/db/schema", () => ({
  profilesSchema: {
    genre: "genre",
    songClips: "songClips",
    updatedAt: "updatedAt",
  },
}));

vi.mock("@/lib/db/song-clips", () => ({
  getSongClipsByIds: vi.fn().mockResolvedValue([]),
}));

vi.mock("drizzle-orm", () => ({
  inArray: vi.fn((column, values) => ({ column, values, type: "inArray" })),
  eq: vi.fn(),
  ilike: vi.fn(),
  and: vi.fn(),
  asc: vi.fn(),
  desc: mockDesc,
  sql: vi.fn(),
}));

const profile = {
  id: 1,
  profileName: "Test Band",
  genre: "Rock",
  songClips: [{ id: "1", slot: 0 }],
};

describe("getProfilesWithSongClips genre filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue({ offset: mockOffset });
    mockOffset.mockReturnValue({ limit: mockLimit });
  });

  it("returns all profiles when no genres are provided", async () => {
    mockLimit.mockResolvedValue([profile]);

    const results = await getProfilesWithSongClips(0, 15, []);

    expect(mockWhere).toHaveBeenCalledWith(undefined);
    expect(mockOrderBy).toHaveBeenCalledWith({
      column: "updatedAt",
      direction: "desc",
    });
    expect(results).toHaveLength(1);
    expect(results[0]?.genre).toBe("Rock");
  });

  it("filters profiles by the provided genres", async () => {
    mockLimit.mockResolvedValue([profile]);

    await getProfilesWithSongClips(0, 15, ["Rock", "Jazz"]);

    expect(mockWhere).toHaveBeenCalledWith({
      column: "genre",
      values: ["Rock", "Jazz"],
      type: "inArray",
    });
    expect(mockOrderBy).toHaveBeenCalledWith({
      column: "updatedAt",
      direction: "desc",
    });
  });

  it("returns an empty array when no profiles match", async () => {
    mockLimit.mockResolvedValue([]);

    const results = await getProfilesWithSongClips(0, 15, ["Metal"]);

    expect(results).toEqual([]);
  });
});
