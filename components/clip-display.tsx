"use client";

import { useFeedAudio } from "@/context/feed-audio";
import { SongClip, SongClipWithProfile } from "@/lib/db/types";
import { formatPublishedAt } from "@/lib/format-relative-time";
import clsx from "clsx";
import { Disc3, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DecorativeBg from "./decorative-bg";
import SpindleOverlay from "./spindle-overlay";
import WaveSurferUI from "./wave-surfer";

export default function ClipDisplay({
  clip,
  index,
  isActive,
  onFinish,
  isClipFeed = false,
}: {
  clip: SongClip | SongClipWithProfile;
  index: number;
  isActive: boolean;
  onFinish: () => void;
  isClipFeed?: boolean;
}) {
  const { isPlaying } = useFeedAudio();
  const clipWithProfile = clip as SongClipWithProfile;
  const published = formatPublishedAt(clip.updatedAt);

  return (
    <div
      className={clsx(
        "relative flex w-full shrink-0 snap-start basis-full min-w-0 flex-col",
        isClipFeed ? "h-screen py-10" : "h-full min-h-[50vh]",
      )}
      data-clip-slide
      data-clip-index={index}
    >
      {/* Top metadata */}
      <div
        className={clsx(
          "relative z-20 flex w-full shrink-0 flex-col gap-2",
          isClipFeed ? "py-10" : "pb-8",
        )}
      >
        <div className="flex w-full md:flex-row flex-col items-start justify-between gap-2">
          <div className="flex gap-2 text-3xl">
            <h2 className="flex items-center gap-2 font-semibold text-amber-700">
              <Disc3
                className={clsx(
                  "h-5 w-5 animate-spin [animation-duration:8s]",
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
                  className="text-gray-500 underline-offset-4 hover:underline"
                >
                  #{clip.genre}
                </Link>
              </>
            )}
          </div>
          {clip.full_song_url && (
            <a
              href={clip.full_song_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-500 underline-offset-4 hover:underline"
            >
              Listen to full song
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {isClipFeed && (
          <div className="flex w-full md:flex-row flex-col md:items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {clipWithProfile.profileImage && (
                <div className="relative flex h-10 w-10 rounded border">
                  <Image
                    src={clipWithProfile.profileImage}
                    alt={clipWithProfile.profileName}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
              <Link
                href={`/profiles/${clipWithProfile.profileId}`}
                className="text-gray-500"
              >
                by {clipWithProfile.profileName}
              </Link>
            </div>
            {published && (
              <div className="text-xs text-gray-500/80">{published.label}</div>
            )}
          </div>
        )}
      </div>

      {/* Center stage: decorative bg + wave + spindle */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          <DecorativeBg isPlaying={isActive && isPlaying} large={isClipFeed} />
        </div>

        <div
          className={clsx(
            "relative z-10 flex h-50 items-center justify-center md:h-60",
            isClipFeed ? "w-11/12" : "w-11/12",
          )}
        >
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <SpindleOverlay />
          </div>
          <div className="relative z-10 h-full w-full">
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
