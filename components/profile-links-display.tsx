"use client";
import { Profile, ProfileWithSongClips } from "@/lib/db/types";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";

type Props = {
  profile: ProfileWithSongClips | Profile;
};

export default function ProfileLinksDisplay({ profile }: Props) {
  const [hiddenSeparators, setHiddenSeparators] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const linksRef = useRef<HTMLDivElement | null>(null);

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
      ref={linksRef}
      className="flex flex-wrap items-center gap-x-6 gap-y-1 md:text-sm text-xs uppercase tracking-wide"
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
          {index < profileLinks.length - 1 && !hiddenSeparators.has(index) && (
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
  );
}
