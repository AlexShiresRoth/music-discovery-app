import type { SongClip } from "@/lib/db/types";
import { Music, Upload } from "lucide-react";
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
      <div className="flex items-center gap-2">
        <Music size={14} className="text-indigo-500" />
        <span>{clip.title}</span>
      </div>
      {clip.db_url && <audio controls src={clip.db_url} className="w-full" />}
      {clip.full_song_url && (
        <a
          href={clip.full_song_url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-indigo-500 hover:underline"
        >
          {clip.full_song_url}
        </a>
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
    <div className="flex flex-col gap-3 border border-gray-400/80 rounded-md p-4 w-full">
      <div className="flex justify-between items-center gap-1">
        <PreHeader>Clip {slotNumber}</PreHeader>
        <Link
          href={`/profile/edit/song-clips`}
          className="hover:cursor-pointer hover:bg-white/10 p-1 rounded transition-colors"
        >
          <Upload size={14} className="text-white" />
        </Link>
      </div>
      {clip ? (
        <ExistingClipContent clip={clip} />
      ) : (
        <p className="text-sm text-gray-400/80">No clip uploaded</p>
      )}
    </div>
  );
}

export default function SongClipsSection({ clips, isVerified }: Props) {
  const filledSlots = clips.length;

  console.log("clips", clips);
  return (
    <div className="flex flex-col w-full p-8 gap-4 border border-gray-400/80 rounded-md">
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-bold uppercase text-indigo-500">Song Clips</h2>
          {isVerified && (
            <p className="text-sm text-gray-400/80">
              {filledSlots} / {MAX_SONG_CLIPS} clips
            </p>
          )}
        </div>

        {!isVerified && (
          <p className="text-sm text-gray-400/80">
            Verify your account to upload song clips.
          </p>
        )}

        <div className="flex gap-4 w-full">
          {Array.from({ length: MAX_SONG_CLIPS }, (_, index) => (
            <ClipSlotView
              key={index}
              clip={clips[index]}
              slotNumber={index + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
