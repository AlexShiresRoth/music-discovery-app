"use client";

import { track } from "@vercel/analytics";
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
  onFinish: () => void;
};

export const FeedAudioContext = createContext<FeedAudioContextType>({
  isMuted: true,
  toggleMute: () => {},
  isPlaying: true,
  togglePlayPause: () => {},
  canPlay: false,
  setCanPlay: () => {},
  onFinish: () => {},
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
    track("toggle_mute", {
      muted: isMuted,
    });
  }, [isMuted]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((playing) => !playing);
    track("toggle_play_pause", {
      playing: isPlaying,
    });
  }, [isPlaying]);

  const setCanPlay = useCallback((next: boolean) => {
    setCanPlayState(next);
  }, []);

  const onFinish = useCallback(() => {
    setIsPlaying(false);
    track("listen_to_full_clip");
  }, []);

  const value = useMemo(
    () => ({
      isMuted,
      toggleMute,
      isPlaying,
      togglePlayPause,
      canPlay,
      setCanPlay,
      onFinish,
    }),
    [
      isMuted,
      toggleMute,
      isPlaying,
      togglePlayPause,
      canPlay,
      setCanPlay,
      onFinish,
    ],
  );

  return (
    <FeedAudioContext.Provider value={value}>
      {children}
    </FeedAudioContext.Provider>
  );
}
