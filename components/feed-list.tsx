"use client";

import FeedAudioProvider from "@/context/feed-audio";
import { ProfileWithSongClips } from "@/lib/db/types";
import { useIntersectionObserver } from "@/lib/hooks/intersectionobserver";
import { useRef, useState } from "react";
import FeedAudioControls from "./audio-controls";
import IntroOverlay from "./feed-overlay";
import FeedProfile from "./feed-profile";

export default function FeedList({
  profiles,
}: {
  profiles: ProfileWithSongClips[];
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [profileIndex, setProfileIndex] = useState(0);

  useIntersectionObserver({
    selector: "[data-profile-slide]",
    callback: (index: number) => setProfileIndex(index),
    scrollRef,
  });
  return (
    <FeedAudioProvider>
      <main className="flex flex-col gap-4 items-center">
        <div
          ref={scrollRef}
          className="flex flex-col w-full gap-2 snap-y snap-mandatory overflow-y-scroll h-screen"
        >
          {profiles.map((profile, index) => (
            <FeedProfile
              key={profile.id}
              profile={profile}
              activeProfileIndex={profileIndex}
              currentIndex={index}
            />
          ))}
        </div>
      </main>
      <IntroOverlay />
      <FeedAudioControls />
    </FeedAudioProvider>
  );
}
