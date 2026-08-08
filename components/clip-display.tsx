"use client";

import { useFeedAudio } from "@/context/feed-audio";
import { SongClip, SongClipWithProfile } from "@/lib/db/types";
import { formatPublishedAt } from "@/lib/format-relative-time";
import clsx from "clsx";
import { ExternalLink } from "lucide-react";
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
      {/* Top metadata: wide = two rows (title|link, profile|published); mobile = stacked */}
      <div
        className={clsx(
          "relative z-20 grid w-full shrink-0 grid-cols-1 items-start gap-2 md:grid-cols-2",
          isClipFeed ? "py-10" : "pb-8",
        )}
      >
        {/* Stagger: mobile TTB title→profile→link→published→wave; desktop LTR title→link→profile→published→wave */}
        <div
          className={clsx(
            "order-1 flex gap-2 text-xl md:text-3xl [--stagger:0]",
            isActive ? "clip-anim-fade" : "animate-fade-out opacity-0",
          )}
        >
          <h2 className="flex items-center gap-2 font-bold text-amber-700 md:text-4xl text-2xl">
            {clip.title}
          </h2>
          {clip.genre && (
            <div className="flex items-end gap-2 text-gray-400">
              <span>/</span>
              <Link
                href={`/clips?g=${clip.genre}`}
                className="underline-offset-4 hover:underline"
              >
                #{clip.genre}
              </Link>
            </div>
          )}
        </div>

        {clip.full_song_url ? (
          <a
            href={clip.full_song_url}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              "order-3 flex items-center gap-2 text-sm text-gray-500 underline-offset-4 hover:underline md:order-2 md:justify-self-end",
              isClipFeed
                ? "[--stagger:3] md:[--stagger:1]"
                : "[--stagger:1]",
              isActive ? "clip-anim-fade" : "animate-fade-out opacity-0",
            )}
          >
            Listen to full song
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <div className="order-3 hidden md:order-2 md:block" />
        )}

        {isClipFeed && (
          <div className="order-2 flex items-center gap-2 md:order-3">
            {clipWithProfile.profileImage && (
              <div
                className={clsx(
                  "relative flex h-10 w-10 rounded border [--stagger:1] md:[--stagger:2]",
                  isActive ? "clip-anim-translate" : "animate-translate-out",
                )}
              >
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
              className={clsx(
                "text-gray-500 [--stagger:2] md:[--stagger:3]",
                isActive ? "clip-anim-translate" : "animate-translate-out",
              )}
            >
              by {clipWithProfile.profileName}
            </Link>
          </div>
        )}

        {isClipFeed && published && (
          <div
            className={clsx(
              "order-4 text-xs text-gray-500/80 md:justify-self-end [--stagger:4]",
              isActive ? "clip-anim-fade" : "animate-fade-out opacity-0",
            )}
          >
            {published.label}
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
          <div
            className={clsx(
              "relative z-10 h-full w-full",
              isClipFeed ? "[--stagger:5]" : "[--stagger:2]",
              isActive ? "clip-anim-wave" : "animate-waveform-out",
            )}
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
