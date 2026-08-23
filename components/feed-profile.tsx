"use client";

import { ProfileWithSongClips, SongClipWithProfile } from "@/lib/db/types";
import { useIntersectionObserver } from "@/lib/hooks/intersectionobserver";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import ArtistColumn from "./artist-column";
import ClipColumn from "./clip-column";

function FeedProfile({
  profile,
  activeProfileIndex,
  currentIndex,
  advanceToNextProfile,
  clipsLength,
  totalProfiles,
  isAuthenticated,
}: {
  profile: ProfileWithSongClips;
  activeProfileIndex: number;
  currentIndex: number;
  clipsLength: number;
  advanceToNextProfile: (index: number) => void;
  totalProfiles: number;
  isAuthenticated: boolean;
}) {
  const [clipIndex, setClipIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const ignoreObserverRef = useRef(false);
  const songClips = useMemo<SongClipWithProfile[]>(
    () =>
      [...(profile.songClips as SongClipWithProfile[])].sort(
        (a, b) => a.slot - b.slot,
      ),
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
      advanceToNextProfile(currentIndex + 1);
    }
  }, [currentIndex, advanceToNextProfile, clipsLength, clipIndex]);

  useIntersectionObserver({
    selector: "[data-clip-slide]",
    callback: (index: number) => {
      if (ignoreObserverRef.current) return;
      setClipIndex((prev) => (prev === index ? prev : index));
    },
    scrollRef,
  });

  return (
    <div
      data-profile-slide
      data-profile-index={currentIndex}
      className="flex md:flex-row flex-col snap-start min-h-screen gap-8 rounded w-screen max-w-full overflow-x-hidden overflow-y-visible py-10"
    >
      <ArtistColumn
        isActive={currentIndex === activeProfileIndex}
        profile={profile}
        songClips={songClips}
        clipIndex={clipIndex}
        setClipIndex={setClipIndex}
        scrollToClip={scrollToClip}
        advanceToNextProfile={advanceToNextProfile}
        currentIndex={currentIndex}
        totalProfiles={totalProfiles}
        isAuthenticated={isAuthenticated}
      />
      <ClipColumn
        scrollRef={scrollRef}
        songClips={songClips}
        clipIndex={clipIndex}
        setClipIndex={setClipIndex}
        scrollToClip={scrollToClip}
        activeProfileIndex={activeProfileIndex}
        currentIndex={currentIndex}
        handleAdvancePlayback={handleAdvancePlayback}
      />
    </div>
  );
}

export default memo(FeedProfile);
