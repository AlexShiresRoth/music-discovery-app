"use client";

import { SongClip } from "@/lib/db/types";
import WaveSurferUI from "./wave-surfer";

export default function ClipDisplay({
  clip,
  index,
  isActive,
}: {
  clip: SongClip;
  index: number;
  isActive: boolean;
}) {
  return (
    <div
      className="w-full shrink-0 snap-start basis-full min-w-0"
      data-clip-slide
      data-clip-index={index}
    >
      <WaveSurferUI
        url={clip.db_url || ""}
        clipName={clip.title || ""}
        isActive={isActive}
        isOnFeed
      />
    </div>
  );
}
