import { getProfile } from "@/lib/auth";
import { getSongClipsByIds } from "@/lib/db/song-clips";
import EditWrapper from "../../edit-wrapper";
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

  const clips = await getSongClipsByIds(
    profile.songClips.map((clip) => clip.id),
  );

  const slotNumber = parseInt(slot) - 1;

  const clip = clips.find((clip) => clip.slot === slotNumber);

  return (
    <EditWrapper>
      <EditClips
        clip={clip}
        isVerified={profile.isVerified ?? false}
        slot={slotNumber}
      />
    </EditWrapper>
  );
}
