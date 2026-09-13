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
    public: "public",
    openToCollaboration: "openToCollaboration",
    openToGigs: "openToGigs",
    needActForShow: "needActForShow",
  },
}));

vi.mock("@/lib/db/song-clips", () => ({
  getSongClipsByIds: vi.fn().mockResolvedValue([]),
}));

vi.mock("drizzle-orm", () => ({
  inArray: vi.fn((column, values) => ({ column, values, type: "inArray" })),
  eq: vi.fn((column, value) => ({ column, value, type: "eq" })),
  ilike: vi.fn(),
  and: vi.fn((...conditions) => ({
    conditions: conditions.filter(Boolean),
    type: "and",
  })),
  or: vi.fn((...conditions) => ({ conditions, type: "or" })),
  asc: vi.fn(),
  desc: mockDesc,
  sql: vi.fn((strings, ...values) => ({ strings, values, type: "sql" })),
  count: vi.fn(),
}));

const isPublicFilter = { column: "public", value: true, type: "eq" };

const hasSongClipsFilter = {
  strings: ["jsonb_array_length(", ") > 0"],
  values: ["songClips"],
  type: "sql",
};

const profile = {
  id: 1,
  profileName: "Test Band",
  genre: "Rock",
  songClips: [{ id: "1", slot: 0 }],
};

describe("getProfilesWithSongClips status filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue({ offset: mockOffset });
    mockOffset.mockReturnValue({ limit: mockLimit });
  });

  it("returns profiles with song clips when no status filters are provided", async () => {
    mockLimit.mockResolvedValue([profile]);

    const results = await getProfilesWithSongClips(0, 15, []);

    expect(mockWhere).toHaveBeenCalledWith({
      conditions: [isPublicFilter, hasSongClipsFilter],
      type: "and",
    });
    expect(mockOrderBy).toHaveBeenCalledWith({
      column: "updatedAt",
      direction: "desc",
    });
    expect(results).toHaveLength(1);
    expect(results[0]?.genre).toBe("Rock");
  });

  it("filters by a single selected status without forcing others false", async () => {
    mockLimit.mockResolvedValue([profile]);

    await getProfilesWithSongClips(0, 15, ["open-to-collaboration"]);

    expect(mockWhere).toHaveBeenCalledWith({
      conditions: [
        isPublicFilter,
        hasSongClipsFilter,
        {
          column: "openToCollaboration",
          value: true,
          type: "eq",
        },
      ],
      type: "and",
    });
  });

  it("ORs multiple selected status flags", async () => {
    mockLimit.mockResolvedValue([profile]);

    await getProfilesWithSongClips(0, 15, [
      "open-to-collaboration",
      "open-to-gigs",
    ]);

    expect(mockWhere).toHaveBeenCalledWith({
      conditions: [
        isPublicFilter,
        hasSongClipsFilter,
        {
          conditions: [
            {
              column: "openToCollaboration",
              value: true,
              type: "eq",
            },
            {
              column: "openToGigs",
              value: true,
              type: "eq",
            },
          ],
          type: "or",
        },
      ],
      type: "and",
    });
  });

  it("returns an empty array when no profiles match", async () => {
    mockLimit.mockResolvedValue([]);

    const results = await getProfilesWithSongClips(0, 15, ["booking-shows"]);

    expect(results).toEqual([]);
  });
});
