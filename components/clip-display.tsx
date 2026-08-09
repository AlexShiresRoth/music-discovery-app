"use client";

import { SongClip } from "@/lib/db/types";
import clsx from "clsx";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import ClipStage from "./clip-stage";

/** Artist-feed clip slide: metadata at top; stage stacks down on mobile, centered on desktop. */
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
  return (
    <div
      className="@container relative flex h-full min-h-[50vh] w-full shrink-0 snap-start basis-full min-w-0 flex-col overflow-hidden"
      data-clip-slide
      data-clip-index={index}
    >
      <div className="relative z-20 grid w-full shrink-0 grid-cols-1 items-start gap-2 pb-3 md:grid-cols-2 md:pb-8">
        <div
          className={clsx(
            "order-1 flex flex-col gap-2 text-xl md:text-3xl [--stagger:0]",
            isActive ? "clip-anim-fade" : "animate-fade-out opacity-0",
          )}
        >
          <span className="text-xs text-gray-400 -mb-2">Now Playing</span>
          <h2 className="font-bold text-amber-700 text-2xl md:text-4xl">
            {clip.title}
          </h2>
          {clip.genre && (
            <Link
              href={`/clips?g=${clip.genre}`}
              className="text-sm text-gray-400 underline-offset-4 hover:underline"
            >
              {clip.genre}
            </Link>
          )}
        </div>

        {clip.full_song_url && (
          <a
            href={clip.full_song_url}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              "order-2 flex items-center gap-2 justify-self-start text-sm text-gray-500 underline-offset-4 hover:underline md:justify-self-end [--stagger:1]",
              isActive ? "clip-anim-fade" : "animate-fade-out opacity-0",
            )}
          >
            Listen to full song
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <ClipStage
        clip={clip}
        isActive={isActive}
        onFinish={onFinish}
        waveStagger={2}
      />
    </div>
  );
}
