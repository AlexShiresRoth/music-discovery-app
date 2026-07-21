"use client";

import { useFeedAudio } from "@/context/feed-audio";
import { setHasVisited, useLocalStorage } from "@/stores/use-local-storage";
import clsx from "clsx";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

export default function FeedAudioControls() {
  const hasVisited = useLocalStorage();
  const { isMuted, toggleMute, isPlaying, togglePlayPause } = useFeedAudio();
  const [animEnded, setAnimEnded] = useState(false);
  const handleAnimationEnd = () => {
    setAnimEnded(true);
  };
  return (
    <div className="fixed bottom-6 right-6 md:right-20 z-10 flex gap-2">
      <button
        type="button"
        aria-label={isPlaying ? "Pause clips" : "Play clips"}
        onClick={() => {
          togglePlayPause();
          if (!hasVisited) {
            setHasVisited();
          }
        }}
        className="rounded-full bg-black p-3 text-white hover:bg-black transition-colors hover:cursor-pointer relative z-10 overflow-hidden"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        {!hasVisited && (
          <div
            className={clsx(
              "absolute bottom-0 left-0 w-full h-full bg-amber-500 opacity-0 animate-grow-width-delay -z-10",
              animEnded &&
                "border-2 border-white rounded-full transition-all duration-300",
            )}
            onAnimationEnd={handleAnimationEnd}
          />
        )}
      </button>
      <button
        type="button"
        aria-label={isMuted ? "Unmute clips" : "Mute clips"}
        onClick={toggleMute}
        className="rounded-full bg-black p-3 text-white hover:bg-black transition-colors hover:cursor-pointer"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
}
