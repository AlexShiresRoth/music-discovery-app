import {
  getProfilesWithSongClips,
  getProfilesWithSongClipsByLocation,
  getTotalProfilesWithSongClips,
  getTotalProfilesWithSongClipsByLocation,
} from "@/lib/auth/profile";
import { PROFILE_STATUS_FILTERS } from "@/constants";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockSelect,
  mockFrom,
  mockWhere,
  mockOrderBy,
  mockOffset,
  mockLimit,
  mockDesc,
  mockAsc,
} = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockOrderBy: vi.fn(),
  mockOffset: vi.fn(),
  mockLimit: vi.fn(),
  mockDesc: vi.fn((column) => ({ column, direction: "desc" })),
  mockAsc: vi.fn((column) => ({ column, direction: "asc" })),
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
    location: "location",
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
  asc: mockAsc,
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

const openToCollaborationEq = {
  column: "openToCollaboration",
  value: true,
  type: "eq",
};

const openToGigsEq = {
  column: "openToGigs",
  value: true,
  type: "eq",
};

const needActForShowEq = {
  column: "needActForShow",
  value: true,
  type: "eq",
};

const profile = {
  id: 1,
  profileName: "Test Band",
  genre: "Rock",
  songClips: [{ id: "1", slot: 0 }],
};

const { openToCollaboration, openToGigs, needActForShow } =
  PROFILE_STATUS_FILTERS;

function setupListQueryChain() {
  mockSelect.mockReturnValue({ from: mockFrom });
  mockFrom.mockReturnValue({ where: mockWhere });
  mockWhere.mockReturnValue({ orderBy: mockOrderBy });
  mockOrderBy.mockReturnValue({ offset: mockOffset });
  mockOffset.mockReturnValue({ limit: mockLimit });
}

describe("profile status filter queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupListQueryChain();
  });

  describe("getProfilesWithSongClips", () => {
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

      await getProfilesWithSongClips(0, 15, [openToCollaboration.value]);

      expect(mockWhere).toHaveBeenCalledWith({
        conditions: [isPublicFilter, hasSongClipsFilter, openToCollaborationEq],
        type: "and",
      });
    });

    it("ORs multiple selected status flags", async () => {
      mockLimit.mockResolvedValue([profile]);

      await getProfilesWithSongClips(0, 15, [
        openToCollaboration.value,
        openToGigs.value,
      ]);

      expect(mockWhere).toHaveBeenCalledWith({
        conditions: [
          isPublicFilter,
          hasSongClipsFilter,
          {
            conditions: [openToCollaborationEq, openToGigsEq],
            type: "or",
          },
        ],
        type: "and",
      });
    });

    it("ORs all three status flags when all are selected", async () => {
      mockLimit.mockResolvedValue([profile]);

      await getProfilesWithSongClips(0, 15, [
        openToCollaboration.value,
        openToGigs.value,
        needActForShow.value,
      ]);

      expect(mockWhere).toHaveBeenCalledWith({
        conditions: [
          isPublicFilter,
          hasSongClipsFilter,
          {
            conditions: [
              openToCollaborationEq,
              openToGigsEq,
              needActForShowEq,
            ],
            type: "or",
          },
        ],
        type: "and",
      });
    });

    it("ignores unknown status slugs", async () => {
      mockLimit.mockResolvedValue([profile]);

      await getProfilesWithSongClips(0, 15, ["not-a-real-status"]);

      expect(mockWhere).toHaveBeenCalledWith({
        conditions: [isPublicFilter, hasSongClipsFilter],
        type: "and",
      });
    });

    it("returns an empty array when no profiles match", async () => {
      mockLimit.mockResolvedValue([]);

      const results = await getProfilesWithSongClips(0, 15, [
        needActForShow.value,
      ]);

      expect(results).toEqual([]);
    });
  });

  describe("getTotalProfilesWithSongClips", () => {
    it("applies the same OR status condition when counting", async () => {
      mockWhere.mockResolvedValue([{ count: 4 }]);

      const total = await getTotalProfilesWithSongClips([
        openToCollaboration.value,
        openToGigs.value,
      ]);

      expect(total).toBe(4);
      expect(mockWhere).toHaveBeenCalledWith({
        conditions: [
          isPublicFilter,
          hasSongClipsFilter,
          {
            conditions: [openToCollaborationEq, openToGigsEq],
            type: "or",
          },
        ],
        type: "and",
      });
    });

    it("counts without a status condition when none are selected", async () => {
      mockWhere.mockResolvedValue([{ count: 12 }]);

      const total = await getTotalProfilesWithSongClips([]);

      expect(total).toBe(12);
      expect(mockWhere).toHaveBeenCalledWith({
        conditions: [isPublicFilter, hasSongClipsFilter],
        type: "and",
      });
    });
  });

  describe("location queries", () => {
    it("filters nearby profiles by OR'd status flags", async () => {
      mockLimit.mockResolvedValue([profile]);

      await getProfilesWithSongClipsByLocation(-97.74, 30.27, [
        openToGigs.value,
        needActForShow.value,
      ]);

      const whereArg = mockWhere.mock.calls[0]?.[0];
      expect(whereArg.type).toBe("and");
      expect(whereArg.conditions).toEqual(
        expect.arrayContaining([
          isPublicFilter,
          hasSongClipsFilter,
          {
            conditions: [openToGigsEq, needActForShowEq],
            type: "or",
          },
        ]),
      );
    });

    it("counts nearby profiles with the same status OR condition", async () => {
      mockWhere.mockResolvedValue([{ count: 2 }]);

      const total = await getTotalProfilesWithSongClipsByLocation(
        -97.74,
        30.27,
        [needActForShow.value],
      );

      expect(total).toBe(2);
      const whereArg = mockWhere.mock.calls[0]?.[0];
      expect(whereArg.conditions).toEqual(
        expect.arrayContaining([isPublicFilter, needActForShowEq]),
      );
    });
  });
});
