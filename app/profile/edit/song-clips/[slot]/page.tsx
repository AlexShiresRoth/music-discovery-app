import { getProfile } from "@/lib/auth";
import { getSongClipsByIds } from "@/lib/db/song-clips";
import EditClips from "./edit-clips";

type Props = {
  params: Promise<{ slot: string }>;
};

export default async function EditSongClips({ params }: Props) {
  const { slot } = await params;

  const profile = await getProfile();

  if (!profile) {
    return null;
  }

  const clips = await getSongClipsByIds(profile.songClips);

  const slotNumber = parseInt(slot) - 1;

  const clip = clips[slotNumber];

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="md:w-1/2 py-6">
        <EditClips
          clip={clip}
          isVerified={profile.isVerified ?? false}
          slot={slotNumber}
        />
      </div>
    </div>
  );
}
