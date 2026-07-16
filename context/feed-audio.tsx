"use client";

import { createContext, useContext, useState } from "react";

type FeedAudioContextType = {
  isMuted: boolean;
  toggleMute: () => void;
  isPlaying: boolean;
  togglePlayPause: () => void;
};

export const FeedAudioContext = createContext<FeedAudioContextType>({
  isMuted: true,
  toggleMute: () => {},
  isPlaying: true,
  togglePlayPause: () => {},
});

export function useFeedAudio() {
  return useContext(FeedAudioContext);
}

export default function FeedAudioProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <FeedAudioContext.Provider
      value={{
        isMuted,
        toggleMute: () => setIsMuted((muted) => !muted),
        isPlaying,
        togglePlayPause: () => setIsPlaying((playing) => !playing),
      }}
    >
      {children}
    </FeedAudioContext.Provider>
  );
}
