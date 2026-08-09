"use client";

import { useFeedAudio } from "@/context/feed-audio";
import { SongClip } from "@/lib/db/types";
import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";
import DecorativeBg from "./decorative-bg";
import SpindleOverlay from "./spindle-overlay";
import WaveSurferUI from "./wave-surfer";

type Props = {
  clip: SongClip;
  isActive: boolean;
  onFinish: () => void;
  waveStagger?: number;
  /** Above the wave — in-flow on mobile; use `md:absolute md:bottom-full` for desktop float. */
  children?: ReactNode;
  className?: string;
};

export default function ClipStage({
  clip,
  isActive,
  onFinish,
  waveStagger = 2,
  children,
  className,
}: Props) {
  const { isPlaying } = useFeedAudio();

  return (
    <div
      className={clsx(
        "relative flex min-h-0 flex-1 flex-col overflow-visible",
        "md:items-center md:justify-center",
        className,
      )}
    >
      <div className="relative w-full md:w-11/12">
        {children}

        {/*
          Shared frame: disc + spindle + wave share this center.
          Disc is sized via clip @container units so it still fills the slide;
          slide overflow-hidden clips bleed into neighbors.
        */}
        <div className="relative h-45 w-full md:h-60">
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
            <DecorativeBg isPlaying={isActive && isPlaying} />
          </div>

          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <SpindleOverlay />
          </div>

          <div
            className={clsx(
              "relative z-10 h-full w-full",
              isActive ? "clip-anim-wave" : "animate-waveform-out",
            )}
            style={{ "--stagger": waveStagger } as CSSProperties}
          >
            <WaveSurferUI
              url={clip.db_url || ""}
              clipName={clip.title || ""}
              isActive={isActive}
              fullSongUrl={clip.full_song_url || ""}
              isOnFeed
              onFinish={onFinish}
              genre={clip.genre || undefined}
              genreFilterUrl={`/clips?g=${clip.genre}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
