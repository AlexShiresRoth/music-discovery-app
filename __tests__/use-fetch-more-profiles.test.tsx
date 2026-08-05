import type { ProfileWithSongClips } from "@/lib/db/types";
import { useFetchMoreData } from "@/lib/hooks/useFetchMoreData";
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

describe("useFetchMoreData", () => {
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

  it("initializes with the provided data", () => {
    const data = makeProfiles(15);

    const { result } = renderHook(() =>
      useFetchMoreData({
        data,
        currentIndex: 0,
        limit: 15,
        baseUrl: "/api/profiles/with-song-clips",
      }),
    );

    expect(result.current.fetchedData).toHaveLength(15);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("does not fetch when the user is far from the end", async () => {
    const data = makeProfiles(15);

    renderHook(() =>
      useFetchMoreData({
        data,
        currentIndex: 5,
        limit: 15,
        baseUrl: "/api/profiles/with-song-clips",
      }),
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("does not fetch when the initial page is smaller than the limit", async () => {
    const data = makeProfiles(10);

    renderHook(() =>
      useFetchMoreData({
        data,
        currentIndex: 9,
        limit: 15,
        baseUrl: "/api/profiles/with-song-clips",
      }),
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("fetches more data when near the end of the list", async () => {
    const data = makeProfiles(15);

    const { result, rerender } = renderHook(
      ({ currentIndex }) =>
        useFetchMoreData({
          data,
          currentIndex,
          limit: 15,
          baseUrl: "/api/profiles/with-song-clips",
        }),
      { initialProps: { currentIndex: 0 } },
    );

    rerender({ currentIndex: 14 });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(result.current.fetchedData).toHaveLength(17);
    });

    const fetchUrl = String(mockFetch.mock.calls[0]?.[0]);
    expect(fetchUrl).toContain("start=15");
    expect(fetchUrl).toContain("limit=15");
  });

  it("includes search params in the fetch url and omits empty values", async () => {
    const data = makeProfiles(15);

    const { rerender } = renderHook(
      ({ currentIndex }) =>
        useFetchMoreData({
          data,
          currentIndex,
          limit: 15,
          baseUrl: "/api/profiles/with-song-clips",
          searchParams: {
            g: ["Rock", "Jazz"],
            lat: "30.27",
            lon: "-97.74",
            q: "",
          },
        }),
      { initialProps: { currentIndex: 0 } },
    );

    rerender({ currentIndex: 14 });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const fetchUrl = new URL(String(mockFetch.mock.calls[0]?.[0]));
    expect(fetchUrl.searchParams.getAll("g")).toEqual(["Rock", "Jazz"]);
    expect(fetchUrl.searchParams.get("lat")).toBe("30.27");
    expect(fetchUrl.searchParams.get("lon")).toBe("-97.74");
    expect(fetchUrl.searchParams.has("q")).toBe(false);
  });

  it("does not restart an in-flight fetch when searchParams identity changes", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const data = makeProfiles(15);
    const { result, rerender } = renderHook(
      ({ searchParams }) =>
        useFetchMoreData({
          data,
          currentIndex: 14,
          limit: 15,
          baseUrl: "/api/profiles/with-song-clips",
          searchParams,
        }),
      { initialProps: { searchParams: { g: ["Rock"], lat: "30.27" } } },
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // New object, same contents — must not abort/restart the request
    rerender({ searchParams: { g: ["Rock"], lat: "30.27" } });

    await act(async () => {
      await Promise.resolve();
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    resolveFetch({
      ok: true,
      json: async () => makeProfiles(2, 16),
    });

    await waitFor(() => {
      expect(result.current.fetchedData).toHaveLength(17);
    });
  });

  it("stops fetching after a short page is returned", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => makeProfiles(1, 16),
    });

    const data = makeProfiles(15);

    const { rerender } = renderHook(
      ({ currentIndex }) =>
        useFetchMoreData({
          data,
          currentIndex,
          limit: 15,
          baseUrl: "/api/profiles/with-song-clips",
        }),
      { initialProps: { currentIndex: 14 } },
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    rerender({ currentIndex: 15 });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("stores fetch errors from network failures", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const data = makeProfiles(15);

    const { result, rerender } = renderHook(
      ({ currentIndex }) =>
        useFetchMoreData({
          data,
          currentIndex,
          limit: 15,
          baseUrl: "/api/profiles/with-song-clips",
        }),
      { initialProps: { currentIndex: 0 } },
    );

    rerender({ currentIndex: 14 });

    await waitFor(() => {
      expect(result.current.error?.message).toBe("Network error");
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("stores an error when the response is not ok", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "boom" }),
    });

    const data = makeProfiles(15);

    const { result, rerender } = renderHook(
      ({ currentIndex }) =>
        useFetchMoreData({
          data,
          currentIndex,
          limit: 15,
          baseUrl: "/api/profiles/with-song-clips",
        }),
      { initialProps: { currentIndex: 0 } },
    );

    rerender({ currentIndex: 14 });

    await waitFor(() => {
      expect(result.current.error?.message).toBe("Failed to load more (500)");
    });
    expect(result.current.fetchedData).toHaveLength(15);
  });
});
