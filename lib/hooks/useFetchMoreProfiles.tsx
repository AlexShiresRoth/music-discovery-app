"use client";
import { useEffect, useState } from "react";
import { ProfileWithSongClips } from "../db/types";

const DIFF_FROM_END = 3;

export const useFetchMoreProfiles = ({
  currentProfileIndex,
  limit = 15,
  genres = [],
  profiles = [],
  longitude,
  latitude,
}: {
  profiles: ProfileWithSongClips[];
  currentProfileIndex: number;
  limit: number;
  genres?: string[];
  longitude?: number;
  latitude?: number;
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(profiles.length >= limit);
  const [fetchedProfiles, setFetchedProfiles] =
    useState<ProfileWithSongClips[]>(profiles);

  useEffect(() => {
    if (
      currentProfileIndex > fetchedProfiles.length - DIFF_FROM_END &&
      !isLoading &&
      hasMore
    ) {
      (async () => {
        try {
          setIsLoading(true);
          const url = new URL(
            "/api/profiles/with-song-clips",
            window.location.origin,
          );
          url.searchParams.set("start", fetchedProfiles.length.toString());
          url.searchParams.set("limit", limit.toString());

          url.searchParams.set("lon", longitude?.toString() || "");
          url.searchParams.set("lat", latitude?.toString() || "");

          for (const genre of genres) {
            url.searchParams.append("g", genre);
          }

          const res = await fetch(url);
          const data = (await res.json()) as unknown as ProfileWithSongClips[];
          setFetchedProfiles((prev) => [...prev, ...data]);
          setIsLoading(false);
          if (data.length === 0) {
            setHasMore(false);
          }
        } catch (error) {
          setError(error as Error);
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [
    genres,
    limit,
    currentProfileIndex,
    fetchedProfiles.length,
    isLoading,
    hasMore,
    longitude,
    latitude,
  ]);

  return { fetchedProfiles, error, isLoading };
};
