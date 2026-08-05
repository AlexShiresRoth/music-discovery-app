import { POST } from "@/app/api/profile/upload-song-clip/route";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();

const {
  mockSelect,
  mockFrom,
  mockWhere,
  mockLimit,
  mockInsert,
  mockValues,
  mockReturning,
  mockUpdate,
  mockSet,
  mockUpdateWhere,
  mockFromStorage,
  mockUpload,
  mockGetPublicUrl,
} = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockLimit: vi.fn(),
  mockInsert: vi.fn(),
  mockValues: vi.fn(),
  mockReturning: vi.fn(),
  mockUpdate: vi.fn(),
  mockSet: vi.fn(),
  mockUpdateWhere: vi.fn(),
  mockFromStorage: vi.fn(),
  mockUpload: vi.fn(),
  mockGetPublicUrl: vi.fn(),
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
    insert: mockInsert,
    update: mockUpdate,
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

const PUBLIC_URL =
  "https://project.supabase.co/storage/v1/object/public/song-clips/clips/user-1/clip.wav";

const verifiedProfile = {
  id: 1,
  isVerified: true,
  songClips: [{ slot: 1, id: "10" }],
  updatedAt: null as Date | null,
};

const defaultMetadata = {
  index: 0,
  title: "Test Track",
  fullSongUrl: "https://example.com/track",
  selectedRegion: { start: 0, end: 15 },
};

/** Client already trimmed/encoded this before upload. */
const testAudioFile = new File(["wav-bytes"], "track-clip.wav", {
  type: "audio/wav",
});

function makeUploadRequest(options?: {
  file?: File;
  metadata?: object | string;
}) {
  const formData = new FormData();
  const file = options?.file ?? testAudioFile;

  if (file) {
    formData.append("file", file);
  }

  if (options?.metadata !== undefined) {
    formData.append(
      "metadata",
      typeof options.metadata === "string"
        ? options.metadata
        : JSON.stringify(options.metadata),
    );
  } else {
    formData.append("metadata", JSON.stringify(defaultMetadata));
  }

  return new Request("http://localhost/api/profile/upload-song-clip", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/profile/upload-song-clip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SONG_CLIPS_BUCKET_NAME = "song-clips";

    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    mockLimit.mockResolvedValue([verifiedProfile]);
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSelect.mockReturnValue({ from: mockFrom });

    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: PUBLIC_URL } });
    mockFromStorage.mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    });

    mockReturning.mockResolvedValue([
      {
        id: 42,
        slot: 0,
        title: "Test Track",
        db_url: PUBLIC_URL,
        full_song_url: "https://example.com/track",
      },
    ]);
    mockValues.mockReturnValue({ returning: mockReturning });
    mockInsert.mockReturnValue({ values: mockValues });

    mockUpdateWhere.mockResolvedValue(undefined);
    mockSet.mockReturnValue({ where: mockUpdateWhere });
    mockUpdate.mockReturnValue({ set: mockSet });
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(makeUploadRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 404 when profile is not found", async () => {
    mockLimit.mockResolvedValue([]);

    const response = await POST(makeUploadRequest());
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Profile not found");
  });

  it("returns 403 when account is not verified", async () => {
    mockLimit.mockResolvedValue([{ ...verifiedProfile, isVerified: false }]);

    const response = await POST(makeUploadRequest());
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Account must be verified to upload song clips");
  });

  it("returns 400 when no file is attached", async () => {
    const formData = new FormData();
    formData.append("metadata", JSON.stringify(defaultMetadata));

    const response = await POST(
      new Request("http://localhost/api/profile/upload-song-clip", {
        method: "POST",
        body: formData,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("A file is required");
  });

  it("returns 400 when metadata is invalid JSON", async () => {
    const response = await POST(makeUploadRequest({ metadata: "{not-json" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid clip metadata");
  });

  it("returns 400 for a non-audio file", async () => {
    const textFile = new File(["text"], "notes.txt", { type: "text/plain" });

    const response = await POST(makeUploadRequest({ file: textFile }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid audio file");
  });

  it("returns 400 when title is missing", async () => {
    const response = await POST(
      makeUploadRequest({
        metadata: { ...defaultMetadata, title: "   " },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/^Title is required for /);
  });

  it("returns 400 when fullSongUrl is not a valid URL", async () => {
    const response = await POST(
      makeUploadRequest({
        metadata: { ...defaultMetadata, fullSongUrl: "not-a-url" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe(
      'Full Song URL: "not-a-url" is not a valid URL',
    );
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("returns 400 when no clip region is selected", async () => {
    const response = await POST(
      makeUploadRequest({
        metadata: { ...defaultMetadata, selectedRegion: null },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/^Select a clip region for /);
  });

  it("returns 500 when storage upload fails", async () => {
    mockUpload.mockResolvedValue({ error: { message: "Storage full" } });

    const response = await POST(makeUploadRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to upload audio file");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("uploads the pre-trimmed client clip and updates the profile", async () => {
    const response = await POST(makeUploadRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    const [uploadPath, uploadFile, uploadOpts] = mockUpload.mock.calls[0] as [
      string,
      File,
      { upsert: boolean; contentType: string },
    ];
    expect(uploadPath).toMatch(/^clips\/user-1\//);
    expect(uploadPath).toContain("-0-Test Track");
    expect(uploadFile.type).toBe("audio/wav");
    expect(uploadFile.size).toBe(testAudioFile.size);
    expect(uploadOpts).toEqual({
      upsert: true,
      contentType: "audio/mpeg",
    });

    expect(mockInsert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        slot: 0,
        db_url: PUBLIC_URL,
        title: "Test Track",
        full_song_url: "https://example.com/track",
      }),
    );

    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith({
      songClips: [
        { slot: 1, id: "10" },
        { slot: 0, id: "42" },
      ],
      updatedAt: expect.any(Date),
    });
  });

  it("bumps updatedAt when the profile has never been updated", async () => {
    mockLimit.mockResolvedValue([{ ...verifiedProfile, updatedAt: null }]);

    const before = Date.now();
    const response = await POST(makeUploadRequest());
    const after = Date.now();

    expect(response.status).toBe(200);
    const payload = mockSet.mock.calls[0][0] as {
      songClips: unknown[];
      updatedAt: Date;
    };
    expect(payload.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(payload.updatedAt.getTime()).toBeLessThanOrEqual(after);
  });

  it("preserves updatedAt when the last bump is still within the cooldown", async () => {
    const recentUpdatedAt = new Date(Date.now() - 10 * 60 * 1000);
    mockLimit.mockResolvedValue([
      { ...verifiedProfile, updatedAt: recentUpdatedAt },
    ]);

    const response = await POST(makeUploadRequest());

    expect(response.status).toBe(200);
    expect(mockSet).toHaveBeenCalledWith({
      songClips: [
        { slot: 1, id: "10" },
        { slot: 0, id: "42" },
      ],
      updatedAt: recentUpdatedAt,
    });
  });

  it("bumps updatedAt when the cooldown has passed", async () => {
    const staleUpdatedAt = new Date(Date.now() - 2 * 60 * 60 * 1000);
    mockLimit.mockResolvedValue([
      { ...verifiedProfile, updatedAt: staleUpdatedAt },
    ]);

    const response = await POST(makeUploadRequest());

    expect(response.status).toBe(200);
    const payload = mockSet.mock.calls[0][0] as {
      songClips: unknown[];
      updatedAt: Date;
    };
    expect(payload.songClips).toEqual([
      { slot: 1, id: "10" },
      { slot: 0, id: "42" },
    ]);
    expect(payload.updatedAt.getTime()).toBeGreaterThan(
      staleUpdatedAt.getTime(),
    );
  });

  it("sanitizes path separators in the clip title for storage", async () => {
    const response = await POST(
      makeUploadRequest({
        metadata: {
          ...defaultMetadata,
          title: "../../../evil/track",
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    const uploadPath = mockUpload.mock.calls[0][0] as string;
    const filename = uploadPath.split("/").pop()!;

    expect(uploadPath).toMatch(/^clips\/user-1\//);
    expect(filename).not.toMatch(/[/\\]/);
    expect(filename).toContain(".._.._.._evil_track");
  });

  it("scopes the upload path to the authenticated user's ID", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "other-user" } },
    });

    await POST(makeUploadRequest());

    const uploadPath = mockUpload.mock.calls[0][0] as string;
    expect(uploadPath).toMatch(/^clips\/other-user\//);
  });
});
