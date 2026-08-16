import { getSongClips } from "@/lib/auth/clips";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockSelect,
  mockFrom,
  mockWhere,
  mockOrderBy,
  mockLimit,
} = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockOrderBy: vi.fn(),
  mockLimit: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: { select: mockSelect },
}));

vi.mock("@/lib/db/schema", () => ({
  songClipsSchema: {
    genre: "genre",
    updatedAt: "updatedAt",
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
  profileRefId: 42,
};

const profile = {
  id: 42,
  profileName: "Neon Harbor",
  imageUrl: "https://example.com/avatar.jpg",
};

describe("getSongClips public filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns clips only when their profile is public", async () => {
    let selectCall = 0;
    mockSelect.mockImplementation(() => {
      selectCall += 1;
      if (selectCall === 1) {
        return { from: mockFrom };
      }
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([profile]),
        }),
      };
    });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([clip]);

    const results = await getSongClips();

    expect(results).toEqual([
      {
        ...clip,
        profileId: 42,
        profileName: "Neon Harbor",
        profileImage: "https://example.com/avatar.jpg",
      },
    ]);
  });

  it("omits clips whose profile is hidden or missing", async () => {
    let selectCall = 0;
    mockSelect.mockImplementation(() => {
      selectCall += 1;
      if (selectCall === 1) {
        return { from: mockFrom };
      }
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      };
    });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([clip]);

    await expect(getSongClips()).resolves.toEqual([]);
  });

  it("requires public=true when looking up the clip profile", async () => {
    const mockProfileWhere = vi.fn().mockResolvedValue([profile]);
    let selectCall = 0;
    mockSelect.mockImplementation(() => {
      selectCall += 1;
      if (selectCall === 1) {
        return { from: mockFrom };
      }
      return {
        from: vi.fn().mockReturnValue({
          where: mockProfileWhere,
        }),
      };
    });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([clip]);

    await getSongClips();

    expect(mockProfileWhere).toHaveBeenCalledWith({
      conditions: [
        { column: "id", value: 42, type: "eq" },
        { column: "public", value: true, type: "eq" },
      ],
      type: "and",
    });
  });
});
