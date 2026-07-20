"use client";

import { ProfileWithSongClips } from "@/lib/db/types";
import { useIntersectionObserver } from "@/lib/hooks/intersectionobserver";
import clsx from "clsx";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
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
  const [hiddenSeparators, setHiddenSeparators] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<HTMLDivElement | null>(null);

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

  const profileLinks = (
    [
      ["Spotify", profile.spotify],
      ["Apple Music", profile.appleMusic],
      ["Bandcamp", profile.bandcamp],
      ["SoundCloud", profile.soundcloud],
      ["Instagram", profile.instagram],
      ["TikTok", profile.tiktok],
      ["Website", profile.website],
    ] as const
  )
    .filter(([, field]) => field.url && field.show)
    .map(([label, field]) => ({ label, href: field.url }));

  useLayoutEffect(() => {
    const container = linksRef.current;
    if (!container) return;

    const syncSeparators = () => {
      const items = [
        ...container.querySelectorAll<HTMLElement>("[data-profile-link]"),
      ];
      const next = new Set<number>();
      for (let i = 0; i < items.length - 1; i++) {
        if (items[i].offsetTop !== items[i + 1].offsetTop) {
          next.add(i);
        }
      }
      setHiddenSeparators((prev) => {
        if (
          prev.size === next.size &&
          [...next].every((index) => prev.has(index))
        ) {
          return prev;
        }
        return next;
      });
    };

    syncSeparators();
    const observer = new ResizeObserver(syncSeparators);
    observer.observe(container);
    return () => observer.disconnect();
  }, [profileLinks]);

  return (
    <div
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
          <div
            ref={linksRef}
            className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-4 md:text-sm text-xs uppercase tracking-wide"
          >
            {profileLinks.map((link, index) => (
              <span
                key={link.href + index}
                data-profile-link
                className="relative whitespace-nowrap"
              >
                <Link
                  href={link.href}
                  target="_blank"
                  className="hover:underline underline-offset-4 decoration-black/30"
                >
                  {link.label}
                </Link>
                {index < profileLinks.length - 1 &&
                  !hiddenSeparators.has(index) && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute top-0 left-full ml-3 text-black/25 select-none"
                    >
                      /
                    </span>
                  )}
              </span>
            ))}
          </div>
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
