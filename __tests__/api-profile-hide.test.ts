import { GET } from "@/app/api/profile/hide/route";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
vi.mock("@/lib/auth", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

const {
  mockSelect,
  mockFrom,
  mockWhere,
  mockUpdate,
  mockSet,
  mockUpdateWhere,
} = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockUpdate: vi.fn(),
  mockSet: vi.fn(),
  mockUpdateWhere: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: { select: mockSelect, update: mockUpdate },
}));

vi.mock("@/lib/db/schema", () => ({
  profilesSchema: { userRefId: "userRefId", id: "id", public: "public" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((column, value) => ({ column, value, type: "eq" })),
}));

describe("GET /api/profile/hide", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockUpdateWhere });
    mockUpdateWhere.mockResolvedValue(undefined);
  });

  it("returns 500 on auth error", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error("Auth failed"),
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal Server Error");
  });

  it("returns 401 when the user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 404 when the user has no profile", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockWhere.mockResolvedValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Profile not found");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("hides a public profile", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockWhere.mockResolvedValue([{ id: 12, public: true }]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Profile hidden successfully");
    expect(mockSet).toHaveBeenCalledWith({ public: false });
    expect(mockUpdateWhere).toHaveBeenCalledWith({
      column: "id",
      value: 12,
      type: "eq",
    });
  });

  it("makes a hidden profile public", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockWhere.mockResolvedValue([{ id: 12, public: false }]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Profile made public successfully");
    expect(mockSet).toHaveBeenCalledWith({ public: true });
  });

  it("returns 500 when the update fails", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockWhere.mockResolvedValue([{ id: 12, public: true }]);
    mockUpdateWhere.mockRejectedValue(new Error("db down"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal Server Error");
  });
});
