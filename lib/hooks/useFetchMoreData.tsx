"use client";
import { useEffect, useRef, useState } from "react";

const DIFF_FROM_END = 1;

function appendSearchParams(
  url: URL,
  searchParams: Record<string, string | string[]>,
) {
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      if (value !== "") {
        url.searchParams.set(key, value);
      }
      continue;
    }
    for (const item of value) {
      if (item !== "") {
        url.searchParams.append(key, item);
      }
    }
  }
}

export const useFetchMoreData = <T,>({
  currentIndex,
  limit = 15,
  baseUrl,
  data = [],
  searchParams = {},
}: {
  data: T[];
  currentIndex: number;
  baseUrl: string;
  limit?: number;
  searchParams?: Record<string, string | string[]>;
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(data.length >= limit);
  const [fetchedData, setFetchedData] = useState<T[]>(data);
  const isFetchingRef = useRef(false);
  // Primitive dep so a new object with the same contents doesn't re-trigger fetches
  const searchParamsKey = JSON.stringify(searchParams);

  useEffect(() => {
    if (
      currentIndex < fetchedData.length - DIFF_FROM_END ||
      isFetchingRef.current ||
      !hasMore
    ) {
      return;
    }

    const controller = new AbortController();
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const url = new URL(baseUrl, window.location.origin);
        appendSearchParams(
          url,
          JSON.parse(searchParamsKey) as Record<string, string | string[]>,
        );
        url.searchParams.set("start", fetchedData.length.toString());
        url.searchParams.set("limit", limit.toString());

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Failed to load more (${res.status})`);
        }
        const page = (await res.json()) as T[];

        setFetchedData((prev) => [...prev, ...page]);
        if (page.length < limit) {
          setHasMore(false);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!controller.signal.aborted) {
          isFetchingRef.current = false;
          setIsLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
      isFetchingRef.current = false;
    };
  }, [
    limit,
    currentIndex,
    fetchedData.length,
    hasMore,
    baseUrl,
    searchParamsKey,
  ]);

  return { fetchedData, error, isLoading };
};
