"use client";

import { ProfileWithSongClips } from "@/lib/db/types";
import { formatPublishedAt } from "@/lib/format-relative-time";
import { useIntersectionObserver } from "@/lib/hooks/intersectionobserver";
import clsx from "clsx";
import { ArrowRight, ImageIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import ClipDisplay from "./clip-display";
import EmptyState from "./empty-state";
import ProfileLocationDisplay from "./profile-location-display";

function FeedProfile({
  profile,
  activeProfileIndex,
  currentIndex,
  advanceToNextProfile,
  clipsLength,
  totalProfiles,
}: {
  profile: ProfileWithSongClips;
  activeProfileIndex: number;
  currentIndex: number;
  clipsLength: number;
  advanceToNextProfile: (index: number) => void;
  totalProfiles: number;
}) {
  const [clipIndex, setClipIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const ignoreObserverRef = useRef(false);
  const songClips = useMemo(
    () => [...profile.songClips].sort((a, b) => a.slot - b.slot),
    [profile.songClips],
  );

  const scrollToClip = (index: number) => {
    const root = scrollRef.current;
    const clip = root?.querySelector<HTMLElement>(
      `[data-clip-slide][data-clip-index="${index}"]`,
    );
    if (!root || !clip) return;

    // Avoid observer briefly reporting the outgoing slide mid-scroll.
    ignoreObserverRef.current = true;
    clip.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });

    const release = () => {
      ignoreObserverRef.current = false;
      root.removeEventListener("scrollend", release);
    };
    root.addEventListener("scrollend", release, { once: true });
    window.setTimeout(release, 500);
  };

  const handleAdvancePlayback = useCallback(() => {
    if (clipIndex < clipsLength - 1) {
      setClipIndex(clipIndex + 1);
      scrollToClip(clipIndex + 1);
      return;
    } else {
      setClipIndex(0);
      advanceToNextProfile(activeProfileIndex + 1);
    }
  }, [activeProfileIndex, advanceToNextProfile, clipsLength, clipIndex]);

  useIntersectionObserver({
    selector: "[data-clip-slide]",
    callback: (index: number) => {
      if (ignoreObserverRef.current) return;
      setClipIndex((prev) => (prev === index ? prev : index));
    },
    scrollRef,
  });

  const published = formatPublishedAt(profile.updatedAt);

  return (
    <div
      data-profile-slide
      data-profile-index={currentIndex}
      className="flex snap-start min-h-screen gap-8 rounded w-screen max-w-full overflow-hidden py-20"
    >
      <div className="flex flex-col border-r border-r-black/10 pr-8 gap-20">
        <div className="flex flex-col gap-2">
          <div className="relative w-20 h-20 md:w-70 md:h-60 overflow-hidden rounded border">
            {profile.imageUrl && (
              <Image
                src={profile.imageUrl}
                alt={profile.profileName ?? "Profile Image"}
                fill
                loading="eager"
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
            {!profile.imageUrl && (
              <EmptyState
                message="No Image Yet."
                icon={<ImageIcon className="w-10 h-10" />}
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href={`/profiles/${profile.id}`}
              className="text-3xl md:text-4xl w-70 font-bold text-black uppercase hover:underline underline-offset-4 decoration-black"
            >
              {profile.profileName}
            </Link>
            <div className="flex flex-col">
              <ProfileLocationDisplay
                city={profile.city}
                stateCode={profile.stateCode}
              />
            </div>
            {published && (
              <div className="flex flex-col">
                <p className="text-sm text-gray-500">{published.label}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col border-b border-b-black/10 pb-2">
            <p className="font-semibold text-lg">Clips</p>
          </div>
          <div className="flex flex-col gap-4">
            {songClips.length > 0 &&
              songClips.map((clip, index) => (
                <div key={clip.id}>
                  <button
                    type="button"
                    className={clsx(
                      "hover:cursor-pointer hover:text-amber-700 transition-colors duration-300 flex items-center gap-2 relative",
                      clipIndex === index ? "text-amber-700" : "text-gray-500",
                    )}
                    onClick={() => {
                      setClipIndex(index);
                      scrollToClip(index);
                    }}
                  >
                    <PlayIcon
                      className={clsx(
                        "w-3 h-3 shrink-0 transition-opacity duration-300",
                        clipIndex !== index && "opacity-0",
                      )}
                      aria-hidden={clipIndex !== index}
                    />
                    {clip.title}
                  </button>
                </div>
              ))}
          </div>
        </div>
        <div className="flex flex-col h-full justify-end py-4">
          <p className="text-sm text-gray-500">
            Artist {activeProfileIndex + 1} of {totalProfiles}
          </p>
          {activeProfileIndex < totalProfiles - 1 && (
            <button
              type="button"
              onClick={() => advanceToNextProfile(activeProfileIndex + 1)}
              className="hover:cursor-pointer text-gray-400 hover:text-amber-700 transition-colors duration-300 flex items-center gap-2"
            >
              Continue <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-8 w-full justify-start">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-2"
        >
          {songClips.map((clip, index) => (
            <ClipDisplay
              key={clip.id}
              clip={clip}
              index={index}
              isActive={
                clipIndex === index && activeProfileIndex === currentIndex
              }
              onFinish={handleAdvancePlayback}
            />
          ))}
        </div>
        <div className="flex justify-start gap-2">
          {Array.from({ length: songClips.length }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to clip ${index + 1}`}
              onClick={() => {
                setClipIndex(index);
                scrollToClip(index);
              }}
              className="hover:cursor-pointer hover:scale-110 transition-all duration-300"
            >
              <span
                className={clsx(
                  "w-2 h-2 block rounded-full transition-all duration-300",
                  clipIndex === index ? "bg-amber-500/30" : "bg-black",
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(FeedProfile);
