"use client";

import { SongClipWithProfile } from "@/lib/db/types";
import { formatPublishedAt } from "@/lib/format-relative-time";
import clsx from "clsx";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ClipStage from "./clip-stage";

/** Clips-feed slide: metadata floats just above the centered stage. */
export default function ClipFeedDisplay({
  clip,
  index,
  isActive,
  onFinish,
}: {
  clip: SongClipWithProfile;
  index: number;
  isActive: boolean;
  onFinish: () => void;
}) {
  const published = formatPublishedAt(clip.updatedAt);

  return (
    <div
      className="relative flex h-screen w-full shrink-0 snap-start basis-full min-w-0 flex-col py-10"
      data-clip-slide
      data-clip-index={index}
    >
      <ClipStage
        clip={clip}
        isActive={isActive}
        onFinish={onFinish}
        largeBg
        waveStagger={5}
        className="md:translate-y-10 justify-center"
      >
        <div className="relative z-20 mb-4 grid w-full grid-cols-1 items-start gap-2 md:absolute md:bottom-full md:left-0 md:right-0 md:mb-6 md:grid-cols-2">
          <div
            className={clsx(
              "order-1 flex flex-row items-center gap-3 text-xl md:text-3xl [--stagger:0]",
              isActive ? "clip-anim-fade" : "animate-fade-out opacity-0",
            )}
          >
            {clip.profileImage && (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded border md:h-16 md:w-16">
                <Image
                  src={clip.profileImage}
                  alt={clip.profileName}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-gray-400 -mb-2">Now Playing</span>
              <h2 className="font-bold text-amber-700 text-2xl md:text-4xl">
                {clip.title}
              </h2>
            </div>
          </div>

          {(clip.full_song_url || published) && (
            <div
              className={clsx(
                "order-3 flex flex-col gap-0.5 md:order-2 md:row-span-2 md:items-end md:justify-self-end [--stagger:3] md:[--stagger:1]",
                isActive ? "clip-anim-fade" : "animate-fade-out opacity-0",
              )}
            >
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
              {published && (
                <div className="text-xs text-gray-500/80">
                  {published.label}
                </div>
              )}
            </div>
          )}

          <div className="order-2 flex flex-col gap-2 md:order-3">
            <Link
              href={`/profiles/${clip.profileId}`}
              className={clsx(
                "text-gray-500 [--stagger:2] md:[--stagger:3]",
                isActive ? "clip-anim-translate" : "animate-translate-out",
              )}
            >
              by {clip.profileName}
            </Link>
            {clip.genre && (
              <div className="flex gap-2 text-sm text-gray-400">
                <Link
                  href={`/clips?g=${clip.genre}`}
                  className="underline-offset-4 hover:underline"
                >
                  {clip.genre}
                </Link>
              </div>
            )}
          </div>
        </div>
      </ClipStage>
    </div>
  );
}
