"use client";

import { ProfileWithSongClips } from "@/lib/db/types";
import { useIntersectionObserver } from "@/lib/hooks/intersectionobserver";
import clsx from "clsx";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useRef, useState } from "react";
import ClipDisplay from "./clip-display";
import EmptyState from "./empty-state";
import ProfileLocationDisplay from "./profile-location-display";

function FeedProfile({
  profile,
  activeProfileIndex,
  currentIndex,
  advanceToNextProfile,
  clipsLength,
}: {
  profile: ProfileWithSongClips;
  activeProfileIndex: number;
  currentIndex: number;
  clipsLength: number;
  advanceToNextProfile: (index: number) => void;
}) {
  const [clipIndex, setClipIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollToClip = (index: number) => {
    const clip = scrollRef.current?.querySelector<HTMLElement>(
      `[data-clip-slide][data-clip-index="${index}"]`,
    );
    clip?.scrollIntoView({ behavior: "smooth", inline: "start" });
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
    callback: (index: number) => setClipIndex(index),
    scrollRef,
  });

  return (
    <div
      data-profile-slide
      data-profile-index={currentIndex}
      className="flex flex-col justify-center gap-8 snap-start min-h-screen py-20 md:py-32 rounded w-screen max-w-full overflow-hidden"
    >
      <div className="flex md:flex-row flex-col md:items-center gap-8 w-full">
        <div className="relative w-20 h-20  md:w-40 md:h-40 overflow-hidden rounded border">
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
          <div className="flex gap-2">
            <ProfileLocationDisplay
              city={profile.city}
              stateCode={profile.stateCode}
              countryCode={profile.countryCode}
            />
          </div>
          <Link
            href={`/profiles/${profile.id}`}
            className="text-3xl md:text-7xl font-bold text-black uppercase hover:underline underline-offset-4 decoration-black"
          >
            {profile.profileName}
          </Link>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none gap-2"
      >
        {profile.songClips
          .sort((a, b) => a.slot - b.slot)
          .map((clip, index) => (
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
      <div className="flex justify-center gap-2 w-full">
        {Array.from({ length: profile.songClips.length }).map((_, index) => (
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
  );
}

export default memo(FeedProfile);
