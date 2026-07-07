import { getProfile } from "@/lib/auth";
import { getSongClipsByIds } from "@/lib/db/song-clips";
import ChooseProfile from "./intro";
import Profile from "./profile";

export default async function ProfilePage() {
  const profile = await getProfile();

  if (profile) {
    const clips = await getSongClipsByIds(profile.songClips);
    return <Profile profile={profile} clips={clips} />;
  }

  return <ChooseProfile />;
}
