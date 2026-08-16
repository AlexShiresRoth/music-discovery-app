import {
  getProfile,
  getProfileById,
  getPublicProfilesForSitemap,
} from "@/lib/auth/profile";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockSelect,
  mockFrom,
  mockWhere,
  mockLimit,
  mockOrderBy,
  mockGetSession,
  mockGetSongClipsByIds,
} = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockLimit: vi.fn(),
  mockOrderBy: vi.fn(),
  mockGetSession: vi.fn(),
  mockGetSongClipsByIds: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return { ...actual, cache: <T extends (...args: never[]) => unknown>(fn: T) => fn };
});

vi.mock("@/lib/db", () => ({
  db: { select: mockSelect },
}));

vi.mock("@/lib/db/schema", () => ({
  profilesSchema: {
    id: "id",
    public: "public",
    userRefId: "userRefId",
    updatedAt: "updatedAt",
    imageUrl: "imageUrl",
  },
}));

vi.mock("@/lib/db/song-clips", () => ({
  getSongClipsByIds: mockGetSongClipsByIds,
}));

vi.mock("@/lib/auth/session", () => ({
  getSession: mockGetSession,
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((column, value) => ({ column, value, type: "eq" })),
  and: vi.fn((...conditions) => ({ conditions, type: "and" })),
  desc: vi.fn((column) => ({ column, direction: "desc" })),
  asc: vi.fn(),
  ilike: vi.fn(),
  inArray: vi.fn(),
  sql: vi.fn(),
  count: vi.fn(),
}));

const publicProfile = {
  id: 1,
  public: true,
  userRefId: "owner-1",
  profileName: "Public Band",
  songClips: [{ id: 10, slot: 0 }],
};

const hiddenProfile = {
  id: 2,
  public: false,
  userRefId: "owner-2",
  profileName: "Hidden Band",
  songClips: [{ id: 20, slot: 0 }],
};

describe("profile visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ from: mockFrom });
    mockGetSongClipsByIds.mockResolvedValue([{ id: 10, title: "Clip" }]);
  });

  describe("getProfile", () => {
    it("loads the current user's profile without a public filter", async () => {
      mockGetSession.mockResolvedValue({ id: "owner-2" });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      mockLimit.mockResolvedValue([hiddenProfile]);

      const profile = await getProfile();

      expect(profile).toEqual(hiddenProfile);
      expect(mockWhere).toHaveBeenCalledWith({
        column: "userRefId",
        value: "owner-2",
        type: "eq",
      });
    });

    it("returns null when there is no session", async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(getProfile()).resolves.toBeNull();
      expect(mockSelect).not.toHaveBeenCalled();
    });
  });

  describe("getProfileById", () => {
    beforeEach(() => {
      mockFrom.mockReturnValue({ where: mockWhere });
    });

    it("returns a public profile for anonymous viewers", async () => {
      mockWhere.mockResolvedValue([publicProfile]);
      mockGetSession.mockResolvedValue(null);

      const profile = await getProfileById("1");

      expect(profile).toEqual({
        ...publicProfile,
        songClips: [{ id: 10, title: "Clip" }],
      });
      expect(mockGetSongClipsByIds).toHaveBeenCalledWith([10]);
    });

    it("hides a private profile from anonymous viewers", async () => {
      mockWhere.mockResolvedValue([hiddenProfile]);
      mockGetSession.mockResolvedValue(null);

      await expect(getProfileById("2")).resolves.toBeNull();
      expect(mockGetSongClipsByIds).not.toHaveBeenCalled();
    });

    it("hides a private profile from other signed-in users", async () => {
      mockWhere.mockResolvedValue([hiddenProfile]);
      mockGetSession.mockResolvedValue({ id: "someone-else" });

      await expect(getProfileById("2")).resolves.toBeNull();
      expect(mockGetSongClipsByIds).not.toHaveBeenCalled();
    });

    it("allows the owner to view their own private profile", async () => {
      mockWhere.mockResolvedValue([hiddenProfile]);
      mockGetSession.mockResolvedValue({ id: "owner-2" });
      mockGetSongClipsByIds.mockResolvedValue([{ id: 20, title: "Secret" }]);

      const profile = await getProfileById("2");

      expect(profile).toEqual({
        ...hiddenProfile,
        songClips: [{ id: 20, title: "Secret" }],
      });
    });

    it("returns null when the profile does not exist", async () => {
      mockWhere.mockResolvedValue([]);

      await expect(getProfileById("999")).resolves.toBeNull();
    });
  });

  describe("getPublicProfilesForSitemap", () => {
    it("only selects public profiles", async () => {
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ orderBy: mockOrderBy });
      mockOrderBy.mockResolvedValue([{ id: 1, updatedAt: new Date(), imageUrl: null }]);

      await getPublicProfilesForSitemap();

      expect(mockWhere).toHaveBeenCalledWith({
        column: "public",
        value: true,
        type: "eq",
      });
      expect(mockOrderBy).toHaveBeenCalledWith({
        column: "updatedAt",
        direction: "desc",
      });
    });

    it("returns an empty array when the query fails", async () => {
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ orderBy: mockOrderBy });
      mockOrderBy.mockRejectedValue(new Error("db down"));

      await expect(getPublicProfilesForSitemap()).resolves.toEqual([]);
    });
  });
});
