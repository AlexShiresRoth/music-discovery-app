import { getProfile } from "@/lib/auth";
import { getSongClipsByIds } from "@/lib/db/song-clips";
import { getProfileVerificationStatus } from "@/lib/profile/verification";
import ChooseProfile from "./intro";
import Profile from "./profile";

export default async function ProfilePage() {
  const profile = await getProfile();

  if (profile) {
    const clips = await getSongClipsByIds(
      profile.songClips.map((clip) => clip.id),
    );
    const verificationRequest = await getProfileVerificationStatus();
    return (
      <Profile
        profile={profile}
        clips={clips}
        verificationRequest={verificationRequest}
      />
    );
  }

  return <ChooseProfile />;
}
