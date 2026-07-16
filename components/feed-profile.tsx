"use client";

import { ProfileWithSongClips } from "@/lib/db/types";
import { useIntersectionObserver } from "@/lib/hooks/intersectionobserver";
import clsx from "clsx";
import Link from "next/link";
import { useRef, useState } from "react";
import ClipDisplay from "./clip-display";

export default function FeedProfile({
  profile,
  activeProfileIndex,
  currentIndex,
}: {
  profile: ProfileWithSongClips;
  activeProfileIndex: number;
  currentIndex: number;
}) {
  const [clipIndex, setClipIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useIntersectionObserver({
    selector: "[data-clip-slide]",
    callback: (index: number) => setClipIndex(index),
    scrollRef,
  });

  const scrollToClip = (index: number) => {
    const clip = scrollRef.current?.querySelector<HTMLElement>(
      `[data-clip-slide][data-clip-index="${index}"]`,
    );
    clip?.scrollIntoView({ behavior: "smooth", inline: "start" });
  };

  const profileLinks = [
    profile.spotify && { label: "Spotify", href: profile.spotify },
    profile.appleMusic && { label: "Apple Music", href: profile.appleMusic },
    profile.bandcamp && { label: "Bandcamp", href: profile.bandcamp },
    profile.soundcloud && { label: "SoundCloud", href: profile.soundcloud },
    profile.instagram && { label: "Instagram", href: profile.instagram },
  ].filter((link): link is { label: string; href: string } => Boolean(link));

  return (
    <div
      key={profile.id}
      data-profile-slide
      className="flex flex-col justify-between snap-start min-h-screen p-8 rounded w-screen max-w-full overflow-hidden"
    >
      <div className="flex gap-2 w-full justify-between">
        <div className="flex flex-col gap-2">
          <p>{profile.genre}</p>
          <div className="flex gap-2">
            <p>
              {profile.city} - {profile.state}
            </p>
          </div>
          <h2 className="text-4xl md:text-7xl font-bold text-black uppercase">
            {profile.profileName}
          </h2>
          <div className="flex flex-wrap items-center gap-y-1 mt-4 md:text-sm text-xs uppercase tracking-wide">
            {profileLinks.map((link, index) => (
              <span key={link.href} className="inline-flex items-center">
                {index > 0 && (
                  <span aria-hidden className="mx-3 text-black/25 select-none">
                    /
                  </span>
                )}
                <Link
                  href={link.href}
                  target="_blank"
                  className="hover:underline underline-offset-4 decoration-black/30"
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none gap-2"
      >
        {profile.songClips.map((clip, index) => (
          <ClipDisplay
            key={clip.id}
            clip={clip}
            index={index}
            isActive={
              clipIndex === index && activeProfileIndex === currentIndex
            }
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
