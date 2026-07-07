import { POST } from "@/app/api/profile/edit/route";
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
  mockSelectWhere,
  mockLimit,
  mockUpdate,
  mockSet,
  mockUpdateWhere,
} = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockSelectWhere: vi.fn(),
  mockLimit: vi.fn(),
  mockUpdate: vi.fn(),
  mockSet: vi.fn(),
  mockUpdateWhere: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: { select: mockSelect, update: mockUpdate },
}));

vi.mock("@/lib/db/schema", () => ({
  profilesSchema: { userRefId: "userRefId" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(() => "mock-condition"),
}));

function makeRequest(body: object) {
  return new Request("http://localhost/api/profile/edit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const existingProfile = {
  id: "profile-1",
  profileName: "Old Profile",
  fullName: "Old Name",
  contactEmail: "old@example.com",
  city: "Old City",
  state: "CA",
  country: "US",
  genre: "Jazz",
  bio: "Old bio",
  imageUrl: null,
  website: "https://old.com",
  facebook: null,
  instagram: null,
  tiktok: null,
  spotify: null,
  appleMusic: null,
  soundcloud: null,
  songClips: [],
  userRefId: "user-1",
  joinedDate: new Date("2024-01-01"),
  isVerified: false,
};

const validUpdateData = {
  profileName: "New Profile",
  fullName: "New Name",
  contactEmail: "new@example.com",
  city: "New City",
  state: "NY",
  country: "US",
  genre: "Rock",
  bio: "New bio",
  website: "https://new.com",
  facebook: "",
  instagram: "",
  tiktok: "",
  spotify: "",
  appleMusic: "",
  soundcloud: "",
};

describe("POST /api/profile/edit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateWhere.mockResolvedValue(undefined);
    mockSet.mockReturnValue({ where: mockUpdateWhere });
    mockUpdate.mockReturnValue({ set: mockSet });
    mockLimit.mockResolvedValue([existingProfile]);
    mockSelectWhere.mockReturnValue({ limit: mockLimit });
    mockFrom.mockReturnValue({ where: mockSelectWhere });
    mockSelect.mockReturnValue({ from: mockFrom });
  });

  it("returns 500 on auth error", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error("Auth failed"),
    });

    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal Server Error");
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("updates profile and returns success", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const response = await POST(makeRequest(validUpdateData));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        profileName: "New Profile",
        fullName: "New Name",
        contactEmail: "new@example.com",
      }),
    );
  });

  it("falls back to existing profile values when request fields are empty", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const response = await POST(
      makeRequest({ profileName: "", fullName: "", contactEmail: "" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        profileName: "Old Profile",
        fullName: "Old Name",
        contactEmail: "old@example.com",
      }),
    );
  });

  it("preserves existing songClips on update", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockLimit.mockResolvedValue([
      { ...existingProfile, songClips: ["clip-1"] },
    ]);

    await POST(makeRequest(validUpdateData));

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ songClips: ["clip-1"] }),
    );
  });

  it("returns 500 when the database update fails", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockUpdateWhere.mockRejectedValue(new Error("DB write failed"));

    const response = await POST(makeRequest(validUpdateData));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("DB write failed");
  });
});
