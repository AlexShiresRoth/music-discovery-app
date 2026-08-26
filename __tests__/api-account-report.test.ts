import { POST } from "@/app/api/account-report/route";
import { enforceRateLimit } from "@/lib/db/redis";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetSession,
  mockSelect,
  mockFrom,
  mockWhere,
  mockInsert,
  mockValues,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockInsert: vi.fn(),
  mockValues: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getSession: mockGetSession,
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
  },
}));

vi.mock("@/lib/db/schema", () => ({
  profilesSchema: { id: "id" },
  accountReportsSchema: { name: "account_reports" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((column, value) => ({ column, value, type: "eq" })),
}));

const mockEnforceRateLimit = vi.mocked(enforceRateLimit);

function makeRequest(body: unknown, ip = "203.0.113.10") {
  return new Request("http://localhost/api/account-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/account-report", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnforceRateLimit.mockResolvedValue(undefined);
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockResolvedValue(undefined);
    mockGetSession.mockResolvedValue({ id: "user-1" });
  });

  it("returns 429 when the rate limiter blocks the request", async () => {
    mockEnforceRateLimit.mockResolvedValue(
      Response.json(
        { message: "Too many requests. Try again later." },
        { status: 429 },
      ),
    );

    const res = await POST(
      makeRequest({
        profileId: "12",
        reportReason: "spam",
        description: "Looks fake",
      }),
    );
    const body = await res.json();

    expect(mockEnforceRateLimit).toHaveBeenCalledWith("report", "203.0.113.10");
    expect(res.status).toBe(429);
    expect(body.message).toBe("Too many requests. Try again later.");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makeRequest({ profileId: "12" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("All fields are required.");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns 404 when the reported profile does not exist", async () => {
    mockWhere.mockResolvedValue([]);

    const res = await POST(
      makeRequest({
        profileId: "99",
        reportReason: "spam",
        description: "Looks fake",
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toBe("Profile not found.");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("inserts a report for a signed-in user", async () => {
    mockWhere.mockResolvedValue([{ id: 12 }]);

    const res = await POST(
      makeRequest({
        profileId: "12",
        reportReason: "spam",
        description: "Looks fake",
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message).toContain("Thank you for reporting");
    expect(mockValues).toHaveBeenCalledWith({
      userRefId: "user-1",
      profileRefId: 12,
      reportReason: "spam",
      description: "Looks fake",
    });
  });

  it("allows anonymous reports with a null userRefId", async () => {
    mockGetSession.mockResolvedValue(null);
    mockWhere.mockResolvedValue([{ id: 12 }]);

    const res = await POST(
      makeRequest({
        profileId: 12,
        reportReason: "copyright-infringement",
        description: "Stolen track",
      }),
    );

    expect(res.status).toBe(201);
    expect(mockValues).toHaveBeenCalledWith({
      userRefId: undefined,
      profileRefId: 12,
      reportReason: "copyright-infringement",
      description: "Stolen track",
    });
  });

  it("returns 500 when the insert fails", async () => {
    mockWhere.mockResolvedValue([{ id: 12 }]);
    mockValues.mockRejectedValue(new Error("db down"));

    const res = await POST(
      makeRequest({
        profileId: "12",
        reportReason: "spam",
        description: "Looks fake",
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Something went wrong. Please try again.");
  });
});
