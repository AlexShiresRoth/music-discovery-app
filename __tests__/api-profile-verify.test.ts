import { POST } from "@/app/api/profile/verify/route";
import { enforceRateLimit } from "@/lib/db/redis";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetUser,
  mockSelect,
  mockFrom,
  mockWhere,
  mockLimit,
  mockInsert,
  mockValues,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockLimit: vi.fn(),
  mockInsert: vi.fn(),
  mockValues: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  createServerClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
  },
}));

vi.mock("@/lib/db/schema", () => ({
  profilesSchema: { userRefId: "userRefId", id: "id" },
  verificationRequestsSchema: { name: "verification_requests" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((column, value) => ({ column, value, type: "eq" })),
}));

const mockEnforceRateLimit = vi.mocked(enforceRateLimit);

function makeRequest(ip = "203.0.113.10") {
  return new Request("http://localhost/api/profile/verify", {
    method: "POST",
    headers: { "x-forwarded-for": ip },
  });
}

describe("POST /api/profile/verify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnforceRateLimit.mockResolvedValue(undefined);
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockResolvedValue(undefined);
  });

  it("returns 429 when rate limited", async () => {
    mockEnforceRateLimit.mockResolvedValue(
      Response.json(
        { message: "Too many requests. Try again later." },
        { status: 429 },
      ),
    );

    const res = await POST(makeRequest());

    expect(res.status).toBe(429);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns 404 when the user has no profile", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockLimit.mockResolvedValue([]);

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Profile not found");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("inserts an open verification request for the profile", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockLimit.mockResolvedValue([{ id: 42, userRefId: "user-1" }]);

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toContain("Profile request submitted");
    expect(mockInsert).toHaveBeenCalledWith({
      name: "verification_requests",
    });
    expect(mockValues).toHaveBeenCalledWith({
      userRefId: "user-1",
      profileRefId: 42,
      status: "open",
    });
  });

  it("returns 500 when the insert fails", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockLimit.mockResolvedValue([{ id: 42 }]);
    mockValues.mockRejectedValue(new Error("db down"));

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Internal server error");
  });
});
