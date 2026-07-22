"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type FeedAudioContextType = {
  isMuted: boolean;
  toggleMute: () => void;
  isPlaying: boolean;
  togglePlayPause: () => void;
  canPlay: boolean;
  setCanPlay: (canPlay: boolean) => void;
};

export const FeedAudioContext = createContext<FeedAudioContextType>({
  isMuted: true,
  toggleMute: () => {},
  isPlaying: true,
  togglePlayPause: () => {},
  canPlay: false,
  setCanPlay: () => {},
});

export function useFeedAudio() {
  return useContext(FeedAudioContext);
}

export default function FeedAudioProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlayState] = useState(false);

  const toggleMute = useCallback(() => {
    setIsMuted((muted) => !muted);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((playing) => !playing);
  }, []);

  const setCanPlay = useCallback((next: boolean) => {
    setCanPlayState(next);
  }, []);

  const value = useMemo(
    () => ({
      isMuted,
      toggleMute,
      isPlaying,
      togglePlayPause,
      canPlay,
      setCanPlay,
    }),
    [isMuted, toggleMute, isPlaying, togglePlayPause, canPlay, setCanPlay],
  );

  return (
    <FeedAudioContext.Provider value={value}>
      {children}
    </FeedAudioContext.Provider>
  );
}
