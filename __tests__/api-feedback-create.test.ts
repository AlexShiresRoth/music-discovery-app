import { POST as createBugReport } from "@/app/api/bug-reports/route";
import { POST as createFeatureRequest } from "@/app/api/feature-requests/route";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetUser, mockInsert, mockValues } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockInsert: vi.fn(),
  mockValues: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  createServerClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock("@/lib/db", () => ({
  db: { insert: mockInsert },
}));

vi.mock("@/lib/db/schema", () => ({
  featureRequestsSchema: { name: "feature_requests" },
  bugReportsSchema: { name: "bug_reports" },
}));

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("feedback create routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValues.mockResolvedValue(undefined);
    mockInsert.mockReturnValue({ values: mockValues });
  });

  describe("POST /api/feature-requests", () => {
    it("returns 401 when unauthenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const res = await createFeatureRequest(makeRequest({ message: "Hi" }));
      expect(res.status).toBe(401);
    });

    it("returns 400 when message is empty", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const res = await createFeatureRequest(makeRequest({ message: "   " }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBe("Message is required");
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("inserts a feature request for the signed-in user", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const res = await createFeatureRequest(
        makeRequest({ message: "  Add playlists  " }),
      );
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.message).toBe("Feature request submitted");
      expect(mockInsert).toHaveBeenCalledWith({ name: "feature_requests" });
      expect(mockValues).toHaveBeenCalledWith({
        message: "Add playlists",
        userRefId: "user-1",
      });
    });
  });

  describe("POST /api/bug-reports", () => {
    it("inserts a bug report for the signed-in user", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const res = await createBugReport(
        makeRequest({ message: "Feed freezes on scroll" }),
      );
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.message).toBe("Bug report submitted");
      expect(mockInsert).toHaveBeenCalledWith({ name: "bug_reports" });
      expect(mockValues).toHaveBeenCalledWith({
        message: "Feed freezes on scroll",
        userRefId: "user-1",
      });
    });

    it("returns 500 when the insert fails", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });
      mockValues.mockRejectedValue(new Error("db down"));

      const res = await createBugReport(makeRequest({ message: "Broken" }));
      expect(res.status).toBe(500);
    });
  });
});
