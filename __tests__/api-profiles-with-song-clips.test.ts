import { GET } from "@/app/api/profiles/with-song-clips/route";
import { PROFILE_STATUS_FILTERS } from "@/constants";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetProfilesWithSongClips,
  mockGetProfilesWithSongClipsByLocation,
} = vi.hoisted(() => ({
  mockGetProfilesWithSongClips: vi.fn(),
  mockGetProfilesWithSongClipsByLocation: vi.fn(),
}));

vi.mock("@/lib/auth/profile", () => ({
  getProfilesWithSongClips: (...args: unknown[]) =>
    mockGetProfilesWithSongClips(...args),
  getProfilesWithSongClipsByLocation: (...args: unknown[]) =>
    mockGetProfilesWithSongClipsByLocation(...args),
}));

const profile = {
  id: 1,
  profileName: "Test Band",
  songClips: [],
};

const { openToCollaboration, openToGigs, needActForShow } =
  PROFILE_STATUS_FILTERS;

function makeRequest(params: Record<string, string | string[]> = {}) {
  const url = new URL("http://localhost/api/profiles/with-song-clips");

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        url.searchParams.append(key, entry);
      }
      continue;
    }
    url.searchParams.set(key, value);
  }

  return new Request(url);
}

describe("GET /api/profiles/with-song-clips", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProfilesWithSongClips.mockResolvedValue([profile]);
    mockGetProfilesWithSongClipsByLocation.mockResolvedValue([profile]);
  });

  it("returns paginated profiles filtered by status", async () => {
    const res = await GET(
      makeRequest({
        start: "15",
        limit: "15",
        status: [openToCollaboration.value, openToGigs.value],
      }),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([profile]);
    expect(mockGetProfilesWithSongClips).toHaveBeenCalledWith(15, 15, [
      openToCollaboration.value,
      openToGigs.value,
    ]);
    expect(mockGetProfilesWithSongClipsByLocation).not.toHaveBeenCalled();
  });

  it("uses location-based pagination when lat and lon are provided", async () => {
    const res = await GET(
      makeRequest({
        start: "0",
        limit: "15",
        lat: "30.27",
        lon: "-97.74",
        status: needActForShow.value,
      }),
    );

    expect(res.status).toBe(200);
    expect(mockGetProfilesWithSongClipsByLocation).toHaveBeenCalledWith(
      -97.74,
      30.27,
      [needActForShow.value],
      0,
      15,
    );
    expect(mockGetProfilesWithSongClips).not.toHaveBeenCalled();
  });

  it("returns an empty array when there are no more profiles", async () => {
    mockGetProfilesWithSongClips.mockResolvedValue([]);

    const res = await GET(makeRequest({ start: "30", limit: "15" }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([]);
  });

  it("passes an empty status list when none are provided", async () => {
    await GET(makeRequest({ start: "0", limit: "15" }));

    expect(mockGetProfilesWithSongClips).toHaveBeenCalledWith(0, 15, []);
  });

  it("returns 500 when the profile query fails", async () => {
    mockGetProfilesWithSongClips.mockRejectedValue(new Error("db down"));

    const res = await GET(makeRequest({ start: "0", limit: "15" }));

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      error: "Internal Server Error",
    });
  });
});
