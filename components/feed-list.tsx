"use client";

import FeedAudioProvider, { useFeedAudio } from "@/context/feed-audio";
import { ProfileWithSongClips } from "@/lib/db/types";
import { useIntersectionObserver } from "@/lib/hooks/intersectionobserver";
import { useFetchMoreProfiles } from "@/lib/hooks/useFetchMoreProfiles";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import FeedAudioControls from "./audio-controls";
import IntroOverlay from "./feed-overlay";
import FeedProfile from "./feed-profile";

function Feed({
  profiles,
  genres,
  longitude,
  latitude,
}: {
  profiles: ProfileWithSongClips[];
  genres: string[];
  longitude?: number;
  latitude?: number;
}) {
  const { onFinish } = useFeedAudio();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [profileIndex, setProfileIndex] = useState(0);
  const { fetchedProfiles, error, isLoading } = useFetchMoreProfiles({
    profiles,
    currentProfileIndex: profileIndex,
    limit: 15,
    genres: [...(genres || [])],
    longitude,
    latitude,
  });

  const handleAdvanceToNextProfile = (index: number) => {
    if (index < fetchedProfiles.length) {
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
          className="flex flex-col w-full gap-2 snap-y snap-mandatory overflow-y-scroll h-screen"
        >
          {fetchedProfiles.map((profile, index) => (
            <FeedProfile
              key={profile.id}
              profile={profile}
              activeProfileIndex={profileIndex}
              currentIndex={index}
              advanceToNextProfile={handleAdvanceToNextProfile}
              clipsLength={profile.songClips.length}
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

export default function FeedList({
  profiles,
}: {
  profiles: ProfileWithSongClips[];
}) {
  const searchParams = useSearchParams();
  const genres = searchParams.getAll("g") || [];
  const longitude = searchParams.get("lon") || "";
  const latitude = searchParams.get("lat") || "";

  return (
    <FeedAudioProvider>
      <Feed
        profiles={profiles}
        genres={genres}
        key={genres.join(",")}
        longitude={longitude ? parseFloat(longitude) : undefined}
        latitude={latitude ? parseFloat(latitude) : undefined}
      />
      <IntroOverlay />
      <FeedAudioControls />
    </FeedAudioProvider>
  );
}
