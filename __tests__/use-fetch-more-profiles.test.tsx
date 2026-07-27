import type { ProfileWithSongClips } from "@/lib/db/types";
import { useFetchMoreProfiles } from "@/lib/hooks/useFetchMoreProfiles";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();

function makeProfile(id: number): ProfileWithSongClips {
  return {
    id,
    profileName: `Band ${id}`,
    songClips: [],
  } as unknown as ProfileWithSongClips;
}

function makeProfiles(count: number, startId = 1) {
  return Array.from({ length: count }, (_, index) =>
    makeProfile(startId + index),
  );
}

describe("useFetchMoreProfiles", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => makeProfiles(2, 16),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("initializes with the provided profiles", () => {
    const profiles = makeProfiles(15);

    const { result } = renderHook(() =>
      useFetchMoreProfiles({
        profiles,
        currentProfileIndex: 0,
        limit: 15,
      }),
    );

    expect(result.current.fetchedProfiles).toHaveLength(15);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("does not fetch when the user is far from the end", async () => {
    const profiles = makeProfiles(15);

    renderHook(() =>
      useFetchMoreProfiles({
        profiles,
        currentProfileIndex: 5,
        limit: 15,
      }),
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("does not fetch when the initial page is smaller than the limit", async () => {
    const profiles = makeProfiles(10);

    renderHook(() =>
      useFetchMoreProfiles({
        profiles,
        currentProfileIndex: 9,
        limit: 15,
      }),
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("fetches more profiles when near the end of the list", async () => {
    const profiles = makeProfiles(15);

    const { result, rerender } = renderHook(
      ({ currentProfileIndex }) =>
        useFetchMoreProfiles({
          profiles,
          currentProfileIndex,
          limit: 15,
        }),
      { initialProps: { currentProfileIndex: 0 } },
    );

    rerender({ currentProfileIndex: 13 });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(result.current.fetchedProfiles).toHaveLength(17);
    });

    const fetchUrl = String(mockFetch.mock.calls[0]?.[0]);
    expect(fetchUrl).toContain("start=15");
    expect(fetchUrl).toContain("limit=15");
  });

  it("includes genre and location params in the fetch url", async () => {
    const profiles = makeProfiles(15);

    const { rerender } = renderHook(
      ({ currentProfileIndex }) =>
        useFetchMoreProfiles({
          profiles,
          currentProfileIndex,
          limit: 15,
          genres: ["Rock", "Jazz"],
          latitude: 30.27,
          longitude: -97.74,
        }),
      { initialProps: { currentProfileIndex: 0 } },
    );

    rerender({ currentProfileIndex: 13 });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const fetchUrl = new URL(String(mockFetch.mock.calls[0]?.[0]));
    expect(fetchUrl.searchParams.getAll("g")).toEqual(["Rock", "Jazz"]);
    expect(fetchUrl.searchParams.get("lat")).toBe("30.27");
    expect(fetchUrl.searchParams.get("lon")).toBe("-97.74");
  });

  it("stops fetching after an empty page is returned", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const profiles = makeProfiles(15);

    const { rerender } = renderHook(
      ({ currentProfileIndex }) =>
        useFetchMoreProfiles({
          profiles,
          currentProfileIndex,
          limit: 15,
        }),
      { initialProps: { currentProfileIndex: 13 } },
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    rerender({ currentProfileIndex: 14 });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("stores fetch errors", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const profiles = makeProfiles(15);

    const { result, rerender } = renderHook(
      ({ currentProfileIndex }) =>
        useFetchMoreProfiles({
          profiles,
          currentProfileIndex,
          limit: 15,
        }),
      { initialProps: { currentProfileIndex: 0 } },
    );

    rerender({ currentProfileIndex: 13 });

    await waitFor(() => {
      expect(result.current.error?.message).toBe("Network error");
    });
    expect(result.current.isLoading).toBe(false);
  });
});
