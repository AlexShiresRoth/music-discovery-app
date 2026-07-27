"use client";
import { useEffect, useState } from "react";
import { ProfileWithSongClips } from "../db/types";

const DIFF_FROM_END = 3;

export const useFetchMoreProfiles = ({
  currentProfileIndex,
  limit = 15,
  genres = [],
  profiles = [],
}: {
  profiles: ProfileWithSongClips[];
  currentProfileIndex: number;
  limit: number;
  genres?: string[];
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
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
          const res = await fetch(
            `/api/profiles/with-song-clips?start=${fetchedProfiles.length}&limit=${limit}&g=${genres.join(",")}`,
          );
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
  ]);

  return { fetchedProfiles, error, isLoading };
};
