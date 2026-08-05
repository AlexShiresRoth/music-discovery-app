"use client";

import { useFeedAudio } from "@/context/feed-audio";
import { SongClip } from "@/lib/db/types";
import clsx from "clsx";
import { Disc3 } from "lucide-react";
import Link from "next/link";
import WaveSurferUI from "./wave-surfer";

export default function ClipDisplay({
  clip,
  index,
  isActive,
  onFinish,
}: {
  clip: SongClip;
  index: number;
  isActive: boolean;
  onFinish: () => void;
}) {
  const { isPlaying } = useFeedAudio();
  return (
    <div
      className="w-full shrink-0 snap-start basis-full min-w-0 flex flex-col gap-4"
      data-clip-slide
      data-clip-index={index}
    >
      <div className="flex gap-2 text-4xl">
        <h2 className="font-semibold flex items-center gap-2 text-amber-700">
          <Disc3
            className={clsx(
              "animate-spin",
              !(isActive && isPlaying) && "[animation-play-state:paused]",
            )}
          />
          {clip.title}
        </h2>
        {clip.genre && (
          <>
            <span>/</span>
            <Link
              href={`/clips?g=${clip.genre}`}
              className="text-gray-500 hover:underline underline-offset-4"
            >
              #{clip.genre}
            </Link>
          </>
        )}
      </div>
      <div className="flex flex-col col h-90">
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
  );
}
