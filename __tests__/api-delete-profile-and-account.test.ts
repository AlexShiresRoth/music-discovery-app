import { DELETE as deleteAccount } from "@/app/api/account/delete/route";
import { DELETE as deleteProfile } from "@/app/api/profile/delete/route";
import { enforceRateLimit } from "@/lib/db/redis";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
const mockDeleteUser = vi.fn();
const mockDeleteProfileForUser = vi.fn();
const mockEnforceRateLimit = vi.mocked(enforceRateLimit);

const { mockDelete, mockWhere } = vi.hoisted(() => ({
  mockDelete: vi.fn(),
  mockWhere: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  createServerClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
  createAdminClient: vi.fn(() => ({
    auth: { admin: { deleteUser: mockDeleteUser } },
  })),
}));

vi.mock("@/lib/profile/delete-profile", () => ({
  deleteProfileForUser: (...args: unknown[]) =>
    mockDeleteProfileForUser(...args),
}));

vi.mock("@/lib/db", () => ({
  db: {
    delete: mockDelete,
  },
}));

vi.mock("@/lib/db/schema", () => ({
  verificationRequestsSchema: {
    name: "verification_requests",
    userRefId: "userRefId",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((column, value) => ({ column, value, type: "eq" })),
}));

function makeRequest(path: string) {
  return new Request(`http://localhost${path}`, {
    method: "DELETE",
    headers: { "x-forwarded-for": "203.0.113.10" },
  });
}

describe("DELETE /api/profile/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnforceRateLimit.mockResolvedValue(undefined);
    mockDelete.mockReturnValue({ where: mockWhere });
    mockWhere.mockResolvedValue(undefined);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await deleteProfile(makeRequest("/api/profile/delete") as never);
    expect(res.status).toBe(401);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns 404 when the profile does not exist", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockDeleteProfileForUser.mockResolvedValue({ status: "not_found" });

    const res = await deleteProfile(makeRequest("/api/profile/delete") as never);
    expect(res.status).toBe(404);
    expect(mockDelete).toHaveBeenCalledWith({
      name: "verification_requests",
      userRefId: "userRefId",
    });
    expect(mockWhere).toHaveBeenCalledWith({
      column: "userRefId",
      value: "user-1",
      type: "eq",
    });
    expect(mockDeleteProfileForUser).toHaveBeenCalledWith("user-1");
  });

  it("deletes verification requests then the profile", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockDeleteProfileForUser.mockResolvedValue({ status: "deleted" });

    const res = await deleteProfile(makeRequest("/api/profile/delete") as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Profile deleted");
    expect(mockDelete).toHaveBeenCalledWith({
      name: "verification_requests",
      userRefId: "userRefId",
    });
    expect(mockWhere).toHaveBeenCalledWith({
      column: "userRefId",
      value: "user-1",
      type: "eq",
    });
    expect(mockDelete.mock.invocationCallOrder[0]).toBeLessThan(
      mockDeleteProfileForUser.mock.invocationCallOrder[0],
    );
  });
});

describe("DELETE /api/account/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnforceRateLimit.mockResolvedValue(undefined);
    mockDeleteUser.mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ where: mockWhere });
    mockWhere.mockResolvedValue(undefined);
  });

  it("deletes the profile, auth user, and verification requests", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockDeleteProfileForUser.mockResolvedValue({ status: "deleted" });

    const res = await deleteAccount(makeRequest("/api/account/delete"));
    const body = await res.json();

    expect(mockDeleteProfileForUser).toHaveBeenCalledWith("user-1");
    expect(mockDeleteUser).toHaveBeenCalledWith("user-1");
    expect(mockDelete).toHaveBeenCalledWith({
      name: "verification_requests",
      userRefId: "userRefId",
    });
    expect(mockWhere).toHaveBeenCalledWith({
      column: "userRefId",
      value: "user-1",
      type: "eq",
    });
    expect(res.status).toBe(200);
    expect(body.message).toBe("Account deleted successfully");
  });

  it("still deletes the auth user and verification requests when no profile exists", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockDeleteProfileForUser.mockResolvedValue({ status: "not_found" });

    const res = await deleteAccount(makeRequest("/api/account/delete"));

    expect(res.status).toBe(200);
    expect(mockDeleteUser).toHaveBeenCalledWith("user-1");
    expect(mockDelete).toHaveBeenCalledWith({
      name: "verification_requests",
      userRefId: "userRefId",
    });
  });

  it("does not delete the auth user or verification requests if profile cleanup fails", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockDeleteProfileForUser.mockResolvedValue({
      status: "error",
      message: "Failed to delete clips",
    });

    const res = await deleteAccount(makeRequest("/api/account/delete"));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to delete clips");
    expect(mockDeleteUser).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
