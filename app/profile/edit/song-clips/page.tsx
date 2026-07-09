import { getProfile } from "@/lib/auth";
import { getSongClipsByIds } from "@/lib/db/song-clips";
import EditClips from "./edit-clips";

export default async function EditSongClips() {
  const profile = await getProfile();

  if (!profile) {
    return null;
  }

  const clips = await getSongClipsByIds(profile.songClips);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="md:w-1/2 py-6">
        <EditClips clips={clips} isVerified={profile.isVerified ?? false} />
      </div>
    </div>
  );
}
