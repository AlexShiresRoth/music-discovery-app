"use client";

import { useFeedAudio } from "@/context/feed-audio";
import { setHasVisited } from "@/lib/has-visited";
import { useHasVisited } from "@/stores/use-has-visited";
import clsx from "clsx";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function FeedAudioControls() {
  const isClient = useIsClient();
  const hasVisited = useHasVisited();
  const showFirstVisitHint = isClient && !hasVisited;
  const router = useRouter();
  const { isMuted, toggleMute, isPlaying, togglePlayPause, canPlay } =
    useFeedAudio();
  const [animEnded, setAnimEnded] = useState(false);
  const handleAnimationEnd = () => {
    setAnimEnded(true);
  };
  return (
    <div className="fixed bottom-6 right-6 z-10 flex gap-2 md:right-20">
      <button
        disabled={!canPlay}
        type="button"
        aria-label={isPlaying ? "Pause clips" : "Play clips"}
        onClick={() => {
          togglePlayPause();
          if (!hasVisited) {
            setHasVisited();
            router.refresh();
          }
        }}
        className="relative z-10 overflow-hidden rounded-full bg-black p-3 text-white transition-colors hover:cursor-pointer hover:bg-black disabled:animate-pulse disabled:opacity-50"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        {showFirstVisitHint && (
          <div
            className={clsx(
              "absolute bottom-0 left-0 -z-10 h-full w-full bg-amber-500 opacity-0 animate-grow-width-delay",
              animEnded && "rounded-full transition-all duration-300",
            )}
            onAnimationEnd={handleAnimationEnd}
          />
        )}
      </button>
      <button
        disabled={!canPlay}
        type="button"
        aria-label={isMuted ? "Unmute clips" : "Mute clips"}
        onClick={toggleMute}
        className="rounded-full bg-black p-3 text-white transition-colors hover:cursor-pointer hover:bg-black disabled:animate-pulse disabled:opacity-50"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
}
