"use client";

import { useFeedAudio } from "@/context/feed-audio";
import { SongClip } from "@/lib/db/types";
import clsx from "clsx";
import { Disc3, ExternalLink } from "lucide-react";
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
      <div className="flex flex-col md:flex-row gap-2 justify-between">
        <div className="flex gap-2 text-2xl md:text-4xl">
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
        <div className="flex items-end gap-2">
          {clip.full_song_url && (
            <a
              href={clip.full_song_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:underline underline-offset-4 flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Listen to full song
            </a>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center h-[45vh] md:h-screen relative overflow-hidden">
        {/* Vinyl background - TODO move this to a separate component */}
        <div
          className={clsx(
            "absolute z-0 md:w-300 md:h-300 w-120 h-120 bg-background rounded-full border-2 border-black/10 flex items-center justify-center",
          )}
        >
          <div
            className={clsx(
              "w-3/4 h-3/4 border-t-2 border-black/10 rounded-full flex items-center justify-center",
              isPlaying && "animate-spin [animation-duration:8s]",
            )}
          >
            <div className="w-1/2 h-1/2 bg-black/5 rounded-full flex items-center justify-center">
              <div className="w-11/12 h-11/12 flex items-center justify-center border-2 border-background rounded-full">
                <div className="w-1/2 h-1/2 bg-background border-4 border-black/5 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="md:w-11/12 w-full">
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
  );
}
