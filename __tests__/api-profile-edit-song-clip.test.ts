import { POST } from "@/app/api/profile/edit-song-clip/route";
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
} = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockLimit: vi.fn(),
  mockUpdate: vi.fn(),
  mockSet: vi.fn(),
  mockUpdateWhere: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: mockSelect,
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

const profile = {
  id: 1,
  userRefId: "user-1",
  isVerified: true,
  songClips: [{ slot: 0, id: "10" }],
  updatedAt: null as Date | null,
};

const existingClip = {
  id: 10,
  slot: 0,
  title: "Old Title",
  db_url: "https://example.com/clip.wav",
  full_song_url: "https://example.com/old-track",
};

function makeRequest(body: object) {
  return new Request("http://localhost/api/profile/edit-song-clip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockProfileThenClip(clip: typeof existingClip | null = existingClip) {
  mockLimit.mockResolvedValueOnce([profile]);
  mockWhere
    .mockReturnValueOnce({ limit: mockLimit })
    .mockResolvedValueOnce(clip ? [clip] : []);
  mockFrom.mockReturnValue({ where: mockWhere });
  mockSelect.mockReturnValue({ from: mockFrom });
}

describe("POST /api/profile/edit-song-clip", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });

    mockUpdateWhere.mockResolvedValue(undefined);
    mockSet.mockReturnValue({ where: mockUpdateWhere });
    mockUpdate.mockReturnValue({ set: mockSet });

    mockProfileThenClip();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(
      makeRequest({
        id: "10",
        title: "New Title",
        full_song_url: "https://example.com/track",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 404 when profile is not found", async () => {
    mockLimit.mockReset();
    mockWhere.mockReset();
    mockFrom.mockReset();
    mockSelect.mockReset();

    mockLimit.mockResolvedValueOnce([]);
    mockWhere.mockReturnValueOnce({ limit: mockLimit });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSelect.mockReturnValue({ from: mockFrom });

    const response = await POST(
      makeRequest({
        id: "10",
        title: "New Title",
        full_song_url: "https://example.com/track",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Profile not found");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 404 when song clip is not found", async () => {
    mockLimit.mockReset();
    mockWhere.mockReset();
    mockFrom.mockReset();
    mockSelect.mockReset();
    mockProfileThenClip(null);

    const response = await POST(
      makeRequest({
        id: "999",
        title: "New Title",
        full_song_url: "https://example.com/track",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Song clip not found");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("updates title and full song url then returns success", async () => {
    const response = await POST(
      makeRequest({
        id: "10",
        title: "New Title",
        full_song_url: "  https://example.com/track  ",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith({
      title: "New Title",
      full_song_url: "https://example.com/track",
    });
    expect(mockSet).toHaveBeenCalledWith({
      updatedAt: expect.any(Date),
    });
  });

  it("stores null when full_song_url is empty", async () => {
    const response = await POST(
      makeRequest({
        id: "10",
        title: "New Title",
        full_song_url: "   ",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockSet).toHaveBeenCalledWith({
      title: "New Title",
      full_song_url: null,
    });
  });

  it("bumps profile updatedAt when the cooldown has passed", async () => {
    const staleUpdatedAt = new Date(Date.now() - 2 * 60 * 60 * 1000);
    mockLimit.mockReset();
    mockWhere.mockReset();
    mockFrom.mockReset();
    mockSelect.mockReset();

    mockLimit.mockResolvedValueOnce([
      { ...profile, updatedAt: staleUpdatedAt },
    ]);
    mockWhere
      .mockReturnValueOnce({ limit: mockLimit })
      .mockResolvedValueOnce([existingClip]);
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSelect.mockReturnValue({ from: mockFrom });

    const response = await POST(
      makeRequest({
        id: "10",
        title: "New Title",
        full_song_url: "https://example.com/track",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockSet).toHaveBeenCalledWith({
      title: "New Title",
      full_song_url: "https://example.com/track",
    });
    const profileUpdate = mockSet.mock.calls.find(
      (call) => call[0] && "updatedAt" in call[0],
    )?.[0] as { updatedAt: Date };
    expect(profileUpdate.updatedAt.getTime()).toBeGreaterThan(
      staleUpdatedAt.getTime(),
    );
  });

  it("preserves profile updatedAt when still within the cooldown", async () => {
    const recentUpdatedAt = new Date(Date.now() - 10 * 60 * 1000);
    mockLimit.mockReset();
    mockWhere.mockReset();
    mockFrom.mockReset();
    mockSelect.mockReset();

    mockLimit.mockResolvedValueOnce([
      { ...profile, updatedAt: recentUpdatedAt },
    ]);
    mockWhere
      .mockReturnValueOnce({ limit: mockLimit })
      .mockResolvedValueOnce([existingClip]);
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSelect.mockReturnValue({ from: mockFrom });

    const response = await POST(
      makeRequest({
        id: "10",
        title: "New Title",
        full_song_url: "https://example.com/track",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockSet).toHaveBeenCalledWith({
      title: "New Title",
      full_song_url: "https://example.com/track",
    });
    expect(mockSet).toHaveBeenCalledWith({
      updatedAt: recentUpdatedAt,
    });
  });
});
