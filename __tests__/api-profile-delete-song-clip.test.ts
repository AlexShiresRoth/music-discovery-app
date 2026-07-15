import { DELETE } from "@/app/api/profile/delete-song-clip/route";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();

const {
  mockSelect,
  mockFrom,
  mockWhere,
  mockLimit,
  mockUpdate,
  mockSet,
  mockUpdateWhere,
  mockDelete,
  mockDeleteWhere,
  mockFromStorage,
  mockRemove,
} = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockLimit: vi.fn(),
  mockUpdate: vi.fn(),
  mockSet: vi.fn(),
  mockUpdateWhere: vi.fn(),
  mockDelete: vi.fn(),
  mockDeleteWhere: vi.fn(),
  mockFromStorage: vi.fn(),
  mockRemove: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
  createAdminClient: vi.fn(() => ({ storage: mockStorage })),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: mockSelect,
    update: mockUpdate,
    delete: mockDelete,
  },
}));

vi.mock("@/lib/db/schema", () => ({
  profilesSchema: { userRefId: "userRefId" },
  songClipsSchema: { id: "id" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(() => "mock-condition"),
}));

const mockStorage = {
  from: mockFromStorage,
};

const verifiedProfile = {
  id: 1,
  isVerified: true,
  songClips: [
    { slot: 0, id: "10" },
    { slot: 1, id: "20" },
  ],
};

const storedClip = {
  id: 10,
  slot: 0,
  title: "Test Track",
  db_url:
    "https://project.supabase.co/storage/v1/object/public/song-clips/clips/user-1/my%20track.mp3",
  full_song_url: null,
};

type StoredClip = typeof storedClip;

function makeDeleteRequest(body: object) {
  return new Request("http://localhost/api/profile/delete-song-clip", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockProfileAndClipQueries(
  profile: typeof verifiedProfile = verifiedProfile,
  clip: StoredClip | null = storedClip,
) {
  mockLimit
    .mockResolvedValueOnce([profile])
    .mockResolvedValueOnce(clip === null ? [] : [clip]);
}

describe("DELETE /api/profile/delete-song-clip", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.SONG_CLIPS_BUCKET_NAME = "song-clips";

    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });

    mockWhere.mockReturnValue({ limit: mockLimit });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSelect.mockReturnValue({ from: mockFrom });

    mockUpdateWhere.mockResolvedValue(undefined);
    mockSet.mockReturnValue({ where: mockUpdateWhere });
    mockUpdate.mockReturnValue({ set: mockSet });

    mockDeleteWhere.mockResolvedValue(undefined);
    mockDelete.mockReturnValue({ where: mockDeleteWhere });

    mockRemove.mockResolvedValue({ error: null });
    mockFromStorage.mockReturnValue({ remove: mockRemove });
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const response = await DELETE(makeDeleteRequest({ clipId: "10" }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 when clipId is missing", async () => {
    const response = await DELETE(makeDeleteRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Clip ID is required");
  });

  it("returns 404 when profile is not found", async () => {
    mockLimit.mockResolvedValueOnce([]);

    const response = await DELETE(makeDeleteRequest({ clipId: "10" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Profile not found");
  });

  it("returns 403 when account is not verified", async () => {
    mockProfileAndClipQueries({ ...verifiedProfile, isVerified: false });

    const response = await DELETE(makeDeleteRequest({ clipId: "10" }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Account must be verified to delete song clips");
  });

  it("returns 404 when the song clip is not found", async () => {
    // null = DB returned no row for this clipId (eq filters by id in production)
    mockProfileAndClipQueries(verifiedProfile, null);

    // Client sends a numeric id; profile refs store ids as strings.
    const response = await DELETE(makeDeleteRequest({ clipId: 10 }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Song clip not found");
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it("returns 500 when storage remove fails", async () => {
    mockProfileAndClipQueries();
    mockRemove.mockResolvedValue({ error: { message: "Object not found" } });

    const response = await DELETE(makeDeleteRequest({ clipId: "10" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Object not found");
    expect(mockDelete).toHaveBeenCalled();
  });

  it("removes the clip from the profile, database, and storage", async () => {
    mockProfileAndClipQueries();

    const response = await DELETE(makeDeleteRequest({ clipId: "10" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Song clip deleted successfully");

    expect(mockSet).toHaveBeenCalledWith({
      songClips: [{ slot: 1, id: "20" }],
    });

    expect(mockDelete).toHaveBeenCalled();
    expect(mockRemove).toHaveBeenCalledWith(["clips/user-1/my track.mp3"]);
  });

  it("scopes the storage remove path to the authenticated user's ID", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "other-user" } },
    });
    mockProfileAndClipQueries();

    await DELETE(makeDeleteRequest({ clipId: "10" }));

    expect(mockRemove).toHaveBeenCalledWith(["clips/other-user/my track.mp3"]);
  });

  it("decodes URL-encoded filenames from the clip URL", async () => {
    mockProfileAndClipQueries(verifiedProfile, {
      ...storedClip,
      db_url:
        "https://project.supabase.co/storage/v1/object/public/song-clips/clips/user-1/2024-test%2Ftrack.mp3",
    });

    await DELETE(makeDeleteRequest({ clipId: "10" }));

    expect(mockRemove).toHaveBeenCalledWith([
      "clips/user-1/2024-test/track.mp3",
    ]);
  });
});
