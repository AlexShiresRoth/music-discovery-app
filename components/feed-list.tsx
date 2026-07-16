"use client";

import FeedAudioProvider, { useFeedAudio } from "@/context/feed-audio";
import { ProfileWithSongClips } from "@/lib/db/types";
import { useIntersectionObserver } from "@/lib/hooks/intersectionobserver";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";
import FeedProfile from "./feed-profile";

function FeedAudioControls() {
  const { isMuted, toggleMute, isPlaying, togglePlayPause } = useFeedAudio();

  return (
    <div className="fixed bottom-6 right-6 z-10 flex gap-2">
      <button
        type="button"
        aria-label={isPlaying ? "Pause clips" : "Play clips"}
        onClick={togglePlayPause}
        className="rounded-full bg-black/80 p-3 text-white hover:bg-black transition-colors hover:cursor-pointer"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
      <button
        type="button"
        aria-label={isMuted ? "Unmute clips" : "Mute clips"}
        onClick={toggleMute}
        className="rounded-full bg-black/80 p-3 text-white hover:bg-black transition-colors hover:cursor-pointer"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
}

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
      <FeedAudioControls />
    </FeedAudioProvider>
  );
}
