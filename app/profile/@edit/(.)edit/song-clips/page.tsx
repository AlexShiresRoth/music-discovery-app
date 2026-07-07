import { getProfile } from "@/lib/auth";
import { getSongClipsByIds } from "@/lib/db/song-clips";
import SongClipsSection from "../../../song-clips";

export default async function EditSongClipsModal() {
  const profile = await getProfile();

  if (!profile) {
    return null;
  }

  const clips = await getSongClipsByIds(profile.songClips);

  return (
    <div className="w-full bg-black/50 fixed min-h-screen flex flex-col items-center justify-center">
      <div className="bg-black md:w-1/2">
        <SongClipsSection
          clips={clips}
          isVerified={profile.isVerified ?? false}
          mode="Edit"
        />
      </div>
    </div>
  );
}
