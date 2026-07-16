import WaveSurferUI from "@/components/wave-surfer";
import type { SongClip } from "@/lib/db/types";
import { Edit, Upload } from "lucide-react";
import Link from "next/link";
import PreHeader from "./pre-header";
import { MAX_SONG_CLIPS } from "./schemas";

type Props = {
  clips: SongClip[];
  isVerified: boolean;
};

function ExistingClipContent({ clip }: { clip: SongClip }) {
  return (
    <>
      <div className="flex items-center gap-2"></div>
      {clip.db_url && (
        <WaveSurferUI url={clip.db_url} clipName={clip.title || ""} />
      )}
    </>
  );
}

function ClipSlotView({
  clip,
  slotNumber,
}: {
  clip?: SongClip;
  slotNumber: number;
}) {
  return (
    <div className="flex flex-col gap-3 border rounded-md p-4 w-full">
      <div className="flex justify-between items-center gap-1">
        <PreHeader>Clip {slotNumber}</PreHeader>
        <Link
          href={`/profile/edit/song-clips/${slotNumber}`}
          className="hover:cursor-pointer p-1 rounded transition-colors"
        >
          {clip ? <Edit size={14} /> : <Upload size={14} />}
        </Link>
      </div>
      {clip ? (
        <ExistingClipContent clip={clip} />
      ) : (
        <p className="text-sm ">No clip uploaded</p>
      )}
    </div>
  );
}

export default function SongClipsSection({ clips, isVerified }: Props) {
  const filledSlots = clips.length;

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-bold uppercase  ">Song Clips</h2>
          {isVerified && (
            <p className="text-sm ">
              {filledSlots} / {MAX_SONG_CLIPS} clips
            </p>
          )}
        </div>

        {!isVerified && (
          <p className="text-sm ">Verify your account to upload song clips.</p>
        )}

        <div className="flex gap-4 w-full md:flex-row flex-col">
          {Array.from({ length: MAX_SONG_CLIPS }, (_, index) => {
            const clip = clips.find((clip) => clip.slot === index);
            return (
              <ClipSlotView key={index} clip={clip} slotNumber={index + 1} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
