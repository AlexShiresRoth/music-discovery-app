import { POST } from "@/app/api/profile/reorder-clips/route";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();

vi.mock("@/lib/auth", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

const {
  mockUpdate,
  mockSet,
  mockUpdateWhere,
} = vi.hoisted(() => ({
  mockUpdate: vi.fn(),
  mockSet: vi.fn(),
  mockUpdateWhere: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: { update: mockUpdate },
}));

vi.mock("@/lib/db/schema", () => ({
  profilesSchema: { userRefId: "userRefId", songClips: "songClips" },
  songClipsSchema: { id: "id", slot: "slot" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((column, value) => ({ column, value, type: "eq" })),
}));

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/profile/reorder-clips", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/profile/reorder-clips", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockUpdateWhere });
    mockUpdateWhere.mockResolvedValue(undefined);
  });

  it("returns 401 when the user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await POST(
      makeRequest({ clips: [{ id: "1", slot: 0 }] }),
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("Unauthorized");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("updates profile songClips and each clip slot from list order", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const response = await POST(
      makeRequest({
        clips: [
          { id: "10", slot: 2 },
          { id: "20", slot: 0 },
          { id: "30", slot: 1 },
        ],
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Clips reordered successfully");

    expect(mockSet).toHaveBeenCalledWith({
      songClips: [
        { id: "10", slot: 0 },
        { id: "20", slot: 1 },
        { id: "30", slot: 2 },
      ],
    });
    expect(mockUpdateWhere).toHaveBeenCalledWith({
      column: "userRefId",
      value: "user-1",
      type: "eq",
    });

    // profile update + one update per clip
    expect(mockUpdate).toHaveBeenCalledTimes(4);
    expect(mockUpdateWhere).toHaveBeenCalledWith({
      column: "id",
      value: 10,
      type: "eq",
    });
    expect(mockUpdateWhere).toHaveBeenCalledWith({
      column: "id",
      value: 20,
      type: "eq",
    });
    expect(mockUpdateWhere).toHaveBeenCalledWith({
      column: "id",
      value: 30,
      type: "eq",
    });
  });

  it("returns 500 when the database update fails", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockUpdateWhere.mockRejectedValue(new Error("db down"));

    const response = await POST(
      makeRequest({ clips: [{ id: "1", slot: 0 }] }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Failed to reorder clips");
  });
});
