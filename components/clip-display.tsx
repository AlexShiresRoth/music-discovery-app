"use client";

import { useFeedAudio } from "@/context/feed-audio";
import { SongClip, SongClipWithProfile } from "@/lib/db/types";
import { formatPublishedAt } from "@/lib/format-relative-time";
import clsx from "clsx";
import { Disc3, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DecorativeBg from "./decorative-bg";
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
  isClipFeed: boolean;
}) {
  const { isPlaying } = useFeedAudio();
  const clipWithProfile = clip as SongClipWithProfile;
  const published = formatPublishedAt(clip.updatedAt);
  return (
    <div
      className={clsx(
        "w-full shrink-0 snap-start basis-full min-w-0 flex flex-col gap-4",
        isClipFeed && "py-20 md:py-10",
      )}
      data-clip-slide
      data-clip-index={index}
    >
      <div className="flex flex-col md:flex-row gap-2 justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 text-2xl md:text-4xl">
            <h2 className="font-semibold flex items-center gap-2 text-amber-700">
              <Disc3
                className={clsx(
                  "animate-spin [animation-duration:8s]",
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
          {isClipFeed && (
            <div className="flex items-center gap-2">
              {clipWithProfile.profileImage && (
                <div className="relative flex h-10 w-10 border rounded">
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
          )}
        </div>

        <div
          className={clsx(
            "flex flex-col justify-end gap-2",
            isClipFeed && "justify-start",
          )}
        >
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
          {clip.updatedAt && isClipFeed && (
            <div className="text-gray-500 text-sm">{published?.label}</div>
          )}
        </div>
      </div>
      <div
        className={clsx(
          "flex flex-col items-center justify-center relative overflow-hidden",
          isClipFeed ? "h-[50vh] md:h-[80vh]" : "h-[45vh] md:h-screen",
        )}
      >
        <DecorativeBg isPlaying={isPlaying} />
        <div className={clsx("md:w-11/12 w-full", isClipFeed && "md:w-full")}>
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

{
  /* <div
            key={clip.id}
            data-clip-slide
            data-clip-index={index}
            className="flex flex-col min-h-full w-full justify-center gap-8 shrink-0 snap-start basis-full"
          >
            <div className="flex flex-col gap-4 relative">
              <div className="flex items-center gap-2 text-4xl font-semibold flex-wrap">
                <h1 className="text-amber-700 flex items-center gap-2">
                  <Disc3
                    className={clsx(
                      "w-10 h-10",
                      isPlaying && "animate-spin [animation-duration:8s]",
                    )}
                  />
                  {clip.title}
                </h1>
                {clip.genre && <span className="text-gray-500"> / </span>}
                {clip.genre && (
                  <Link
                    href={`/clips?g=${clip.genre}`}
                    className="text-gray-500 hover:underline underline-offset-4"
                  >
                    #{clip.genre}
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2">
                {clip.profileImage && (
                  <div className="relative flex h-10 w-10 border rounded">
                    <Image
                      src={clip.profileImage}
                      alt={clip.profileName}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <Link
                  href={`/profiles/${clip.profileId}`}
                  className="text-gray-500"
                >
                  by {clip.profileName}
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center h-[50vh] md:h-[70vh] relative md:overflow-hidden">
              <DecorativeBg isPlaying={isPlaying} />
              <div className="w-full">
                <WaveSurferUI
                  url={clip.db_url || ""}
                  clipName={clip.title || ""}
                  isActive={activeClipIndex === index}
                  fullSongUrl={clip.full_song_url || ""}
                  isOnFeed
                  onFinish={() => handleAdvanceToNextClip(index + 1)}
                  genre={clip.genre || undefined}
                  genreFilterUrl={`/clips?g=${clip.genre}`}
                />
              </div>
            </div>
          </div> */
}
