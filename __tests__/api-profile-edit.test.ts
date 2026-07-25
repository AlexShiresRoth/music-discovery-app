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

const social = (url = "", show = true) => ({ url, show });

const existingProfile = {
  id: "profile-1",
  profileName: "Old Profile",
  fullName: "Old Name",
  contactEmail: "old@example.com",
  formattedLocation: "San Francisco, CA, USA",
  city: "San Francisco",
  country: "United States",
  countryCode: "us",
  state: "California",
  stateCode: "CA",
  lat: 37,
  lon: -122,
  location: "POINT(-122 37)",
  genre: "Jazz",
  bio: "Old bio",
  imageUrl: null,
  website: social("https://old.com"),
  facebook: social(),
  instagram: social(),
  tiktok: social(),
  spotify: social(),
  appleMusic: social(),
  soundcloud: social(),
  bandcamp: social(),
  songClips: [],
  userRefId: "user-1",
  joinedDate: new Date("2024-01-01"),
  isVerified: false,
};

const validUpdateData = {
  profileName: "New Profile",
  fullName: "New Name",
  contactEmail: "new@example.com",
  formattedLocation: "New York, NY, USA",
  city: "New York",
  country: "United States",
  countryCode: "us",
  state: "New York",
  stateCode: "NY",
  lat: 40,
  lon: -74,
  genre: "Rock",
  bio: "New bio",
  website: social("https://new.com"),
  facebook: social(),
  instagram: social(),
  tiktok: social(),
  spotify: social(),
  appleMusic: social(),
  soundcloud: social(),
  bandcamp: social(),
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
        formattedLocation: "San Francisco, CA, USA",
        location: "POINT(-122 37)",
      }),
    );
  });

  it("updates location fields and derives a PostGIS point", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const response = await POST(
      makeRequest({
        formattedLocation: "Austin, TX, USA",
        city: "Austin",
        country: "United States",
        countryCode: "us",
        state: "Texas",
        stateCode: "TX",
        lat: 30,
        lon: -97,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        formattedLocation: "Austin, TX, USA",
        city: "Austin",
        lat: 30,
        lon: -97,
        location: "POINT(-97 30)",
      }),
    );
  });

  it("does not overwrite songClips on update", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockLimit.mockResolvedValue([
      { ...existingProfile, songClips: ["clip-1"] },
    ]);

    await POST(makeRequest(validUpdateData));

    expect(mockSet).toHaveBeenCalled();
    const payload = mockSet.mock.calls[0][0];
    expect(payload).not.toHaveProperty("songClips");
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

  describe("social URL validation", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });
    });

    it("accepts a parseable website URL without requiring a platform name", async () => {
      const response = await POST(
        makeRequest({
          ...validUpdateData,
          website: social("https://myband.example"),
        }),
      );

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalled();
    });

    it("accepts platform URLs that include the platform name", async () => {
      const response = await POST(
        makeRequest({
          ...validUpdateData,
          instagram: social("https://instagram.com/myband"),
          spotify: social("https://open.spotify.com/artist/123"),
          bandcamp: social("https://myband.bandcamp.com"),
        }),
      );

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalled();
    });

    it("skips validation when social URLs are empty", async () => {
      const response = await POST(
        makeRequest({
          ...validUpdateData,
          website: social(),
          instagram: social(""),
          spotify: undefined,
        }),
      );

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalled();
    });

    it("returns 400 for an unparseable website URL", async () => {
      const response = await POST(
        makeRequest({
          ...validUpdateData,
          website: social("not-a-url"),
        }),
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('website: "not-a-url" is not a valid website URL');
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("returns 400 when a platform URL is parseable but missing the platform name", async () => {
      const response = await POST(
        makeRequest({
          ...validUpdateData,
          instagram: social("https://example.com/myband"),
        }),
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe(
        'instagram: "https://example.com/myband" is not a valid instagram URL',
      );
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("returns 400 for the first invalid social URL when several are provided", async () => {
      const response = await POST(
        makeRequest({
          ...validUpdateData,
          facebook: social("https://facebook.com/ok"),
          tiktok: social("not-a-tiktok-url"),
          spotify: social("https://open.spotify.com/artist/123"),
        }),
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe(
        'tiktok: "not-a-tiktok-url" is not a valid tiktok URL',
      );
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("persists show:false when toggling social link visibility", async () => {
      const response = await POST(
        makeRequest({
          website: social("https://myband.example", false),
        }),
      );

      expect(response.status).toBe(200);
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          website: { url: "https://myband.example", show: false },
        }),
      );
    });

    it("accepts a visibility-only update without other profile fields", async () => {
      const response = await POST(
        makeRequest({
          instagram: social("https://instagram.com/myband", true),
        }),
      );

      expect(response.status).toBe(200);
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          instagram: { url: "https://instagram.com/myband", show: true },
          profileName: "Old Profile",
          fullName: "Old Name",
        }),
      );
    });
  });
});
