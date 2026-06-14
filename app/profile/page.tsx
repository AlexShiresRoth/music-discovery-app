import { getArtistProfile, getListenerProfile } from "@/lib/auth";
import CreateProfile from "./create-profile";

export default async function ProfilePage() {
  const artistProfile = await getArtistProfile();
  const listenerProfile = await getListenerProfile();

  if (!artistProfile && !listenerProfile) {
    return <CreateProfile />;
  }

  if (artistProfile) {
    return <p>{artistProfile.artistName}</p>;
  }
}
