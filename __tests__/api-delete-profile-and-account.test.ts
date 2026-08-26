import { DELETE as deleteAccount } from "@/app/api/account/delete/route";
import { DELETE as deleteProfile } from "@/app/api/profile/delete/route";
import { enforceRateLimit } from "@/lib/db/redis";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
const mockDeleteUser = vi.fn();
const mockDeleteProfileForUser = vi.fn();
const mockEnforceRateLimit = vi.mocked(enforceRateLimit);

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
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await deleteProfile(makeRequest("/api/profile/delete") as never);
    expect(res.status).toBe(401);
  });

  it("returns 404 when the profile does not exist", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockDeleteProfileForUser.mockResolvedValue({ status: "not_found" });

    const res = await deleteProfile(makeRequest("/api/profile/delete") as never);
    expect(res.status).toBe(404);
    expect(mockDeleteProfileForUser).toHaveBeenCalledWith("user-1");
  });

  it("deletes the profile via the shared helper", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockDeleteProfileForUser.mockResolvedValue({ status: "deleted" });

    const res = await deleteProfile(makeRequest("/api/profile/delete") as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Profile deleted");
  });
});

describe("DELETE /api/account/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnforceRateLimit.mockResolvedValue(undefined);
    mockDeleteUser.mockResolvedValue({ error: null });
  });

  it("reuses profile deletion then deletes the auth user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockDeleteProfileForUser.mockResolvedValue({ status: "deleted" });

    const res = await deleteAccount(makeRequest("/api/account/delete"));
    const body = await res.json();

    expect(mockDeleteProfileForUser).toHaveBeenCalledWith("user-1");
    expect(mockDeleteUser).toHaveBeenCalledWith("user-1");
    expect(res.status).toBe(200);
    expect(body.message).toBe("Account deleted successfully");
  });

  it("still deletes the auth user when no profile exists", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockDeleteProfileForUser.mockResolvedValue({ status: "not_found" });

    const res = await deleteAccount(makeRequest("/api/account/delete"));

    expect(res.status).toBe(200);
    expect(mockDeleteUser).toHaveBeenCalledWith("user-1");
  });

  it("does not delete the auth user if profile cleanup fails", async () => {
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
  });
});
