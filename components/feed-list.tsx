"use client";

import FeedAudioProvider, { useFeedAudio } from "@/context/feed-audio";
import { ProfileWithSongClips, SongClipWithProfile } from "@/lib/db/types";
import { useIntersectionObserver } from "@/lib/hooks/intersectionobserver";
import { useFetchMoreData } from "@/lib/hooks/useFetchMoreData";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import ActionButton from "./action-button";
import FeedAudioControls from "./audio-controls";
import ClipDisplay from "./clip-display";
import IntroOverlay from "./feed-overlay";
import FeedProfile from "./feed-profile";

function Feed({
  profiles,
  genres,
  longitude,
  latitude,
  totalProfiles,
}: {
  profiles: ProfileWithSongClips[];
  genres: string[];
  totalProfiles: number;
  longitude?: number;
  latitude?: number;
}) {
  const { onFinish } = useFeedAudio();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [profileIndex, setProfileIndex] = useState(0);

  const genresKey = genres.join(",");
  const fetchSearchParams = useMemo(() => {
    const params: Record<string, string | string[]> = {};
    if (genresKey) {
      params.g = genresKey.split(",");
    }
    if (longitude != null) {
      params.lon = String(longitude);
    }
    if (latitude != null) {
      params.lat = String(latitude);
    }
    return params;
  }, [genresKey, longitude, latitude]);

  const { fetchedData, error, isLoading } =
    useFetchMoreData<ProfileWithSongClips>({
      data: profiles,
      currentIndex: profileIndex,
      baseUrl: "/api/profiles/with-song-clips",
      searchParams: fetchSearchParams,
    });

  const handleAdvanceToNextProfile = (index: number) => {
    if (index < fetchedData.length) {
      setProfileIndex(index);
      const profileToScrollTo = scrollRef.current?.querySelector<HTMLElement>(
        `[data-profile-slide][data-profile-index="${index}"]`,
      );
      profileToScrollTo?.scrollIntoView({
        behavior: "smooth",
        inline: "start",
      });
    } else {
      onFinish();
    }
  };

  useIntersectionObserver({
    selector: "[data-profile-slide]",
    callback: (index: number) => setProfileIndex(index),
    scrollRef,
  });

  return (
    <>
      <main className="flex flex-col gap-4 items-center">
        <div
          ref={scrollRef}
          className="flex flex-col w-full gap-2 snap-y snap-mandatory overflow-y-scroll h-screen z-0 scrollbar-none"
        >
          {fetchedData.map((profile, index) => (
            <FeedProfile
              key={profile.id}
              profile={profile}
              activeProfileIndex={profileIndex}
              currentIndex={index}
              advanceToNextProfile={handleAdvanceToNextProfile}
              clipsLength={profile.songClips.length}
              totalProfiles={totalProfiles}
            />
          ))}
        </div>
      </main>
      {isLoading && (
        <div className="flex justify-center items-end py-8 h-full fixed bottom-0 left-0 right-0">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      )}
      {error && (
        <div className="flex justify-center items-center fixed w-full bottom-0 left-0 py-8 bg-background">
          <p>{error?.message || "Could not load more"}</p>
        </div>
      )}
    </>
  );
}

function FeedSongClips({
  songClips,
  genres,
}: {
  songClips: SongClipWithProfile[];
  genres: string[];
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeClipIndex, setActiveClipIndex] = useState(0);
  const genresKey = genres.join(",");
  const fetchSearchParams = useMemo(() => {
    return { g: genresKey.split(",") };
  }, [genresKey]);

  const { fetchedData, error, isLoading } =
    useFetchMoreData<SongClipWithProfile>({
      data: songClips,
      currentIndex: activeClipIndex,
      baseUrl: "/api/clips/with-profiles",
      searchParams: fetchSearchParams,
    });

  const handleAdvanceToNextClip = (index: number) => {
    if (index < fetchedData.length) {
      setActiveClipIndex(index);
      const clipToScrollTo = scrollRef.current?.querySelector<HTMLElement>(
        `[data-clip-slide][data-clip-index="${index}"]`,
      );
      clipToScrollTo?.scrollIntoView({
        behavior: "smooth",
        inline: "start",
      });
    }
  };
  useIntersectionObserver({
    selector: "[data-clip-slide]",
    callback: (index: number) => setActiveClipIndex(index),
    scrollRef,
  });

  return (
    <main className="flex flex-col gap-4 items-center">
      <div
        ref={scrollRef}
        className="flex h-screen w-full snap-y snap-mandatory flex-col overflow-y-scroll z-0 scrollbar-none"
      >
        {fetchedData.map((clip, index) => (
          <ClipDisplay
            isClipFeed
            key={clip.id}
            clip={clip}
            index={index}
            isActive={activeClipIndex === index}
            onFinish={() => handleAdvanceToNextClip(index + 1)}
          />
        ))}
      </div>
      {isLoading && (
        <div className="flex justify-center items-end py-8 h-full fixed bottom-0 left-0 right-0">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      )}
      {error && (
        <div className="flex justify-center items-center fixed w-full bottom-0 left-0 py-8 bg-background">
          <p>{error?.message || "Could not load more"}</p>
        </div>
      )}
    </main>
  );
}

export default function FeedList({
  profiles = [],
  songClips = [],
  searchTerm,
  totalProfiles = 15,
}: {
  profiles?: ProfileWithSongClips[];
  searchTerm?: string;
  songClips?: SongClipWithProfile[];
  totalProfiles?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const genres = searchParams.getAll("g") || [];
  const genresKey = genres.join(",");
  const longitude = searchParams.get("lon") || "";
  const latitude = searchParams.get("lat") || "";
  const searchTermOrGenres = searchTerm || genres.join(", ");
  const searchTermOrGenresSpan = (
    <span className="font-bold">{searchTermOrGenres}</span>
  );

  if (profiles.length === 0 && songClips.length === 0) {
    return (
      <div className="flex justify-center flex-col gap-4 items-center h-screen">
        <p className="text-center text-2xl">
          No Artists Yet
          {searchTermOrGenres.length > 0 ? (
            <> for {searchTermOrGenresSpan}.</>
          ) : (
            <>.</>
          )}{" "}
          Be the first.
        </p>
        <ActionButton onClick={() => router.back()} type="button">
          Go Back
        </ActionButton>
      </div>
    );
  }

  if (songClips.length > 0) {
    return (
      <FeedAudioProvider>
        <FeedAudioControls />
        <IntroOverlay />
        <FeedSongClips songClips={songClips} genres={genres} key={genresKey} />
      </FeedAudioProvider>
    );
  }

  return (
    <FeedAudioProvider>
      <Feed
        profiles={profiles}
        genres={genres}
        totalProfiles={totalProfiles}
        key={genres.join(",") + searchTerm + longitude + latitude}
        longitude={longitude ? parseFloat(longitude) : undefined}
        latitude={latitude ? parseFloat(latitude) : undefined}
      />
      <IntroOverlay />
      <FeedAudioControls />
    </FeedAudioProvider>
  );
}
