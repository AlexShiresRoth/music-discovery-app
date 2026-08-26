import { getProfileVerificationStatus } from "@/lib/profile/verification";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetSession,
  mockSelect,
  mockFrom,
  mockWhere,
  mockLimit,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockLimit: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getSession: mockGetSession,
}));

vi.mock("@/lib/db", () => ({
  db: { select: mockSelect },
}));

vi.mock("@/lib/db/schema", () => ({
  verificationRequestsSchema: { userRefId: "userRefId", status: "status" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((column, value) => ({ column, value, type: "eq" })),
}));

describe("getProfileVerificationStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit });
  });

  it("returns null when there is no session", async () => {
    mockGetSession.mockResolvedValue(null);

    await expect(getProfileVerificationStatus()).resolves.toBeNull();
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it("returns the request status for the signed-in user", async () => {
    mockGetSession.mockResolvedValue({ id: "user-1" });
    mockLimit.mockResolvedValue([{ status: "open" }]);

    await expect(getProfileVerificationStatus()).resolves.toBe("open");
    expect(mockWhere).toHaveBeenCalledWith({
      column: "userRefId",
      value: "user-1",
      type: "eq",
    });
  });

  it("returns undefined when the user has no verification request", async () => {
    mockGetSession.mockResolvedValue({ id: "user-1" });
    mockLimit.mockResolvedValue([]);

    await expect(getProfileVerificationStatus()).resolves.toBeUndefined();
  });

  it("returns null when the query fails", async () => {
    mockGetSession.mockResolvedValue({ id: "user-1" });
    mockLimit.mockRejectedValue(new Error("db down"));

    await expect(getProfileVerificationStatus()).resolves.toBeNull();
  });
});
