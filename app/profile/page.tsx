import { getArtistProfile, getListenerProfile } from "@/lib/auth";
import ArtistProfile from "./artist";
import CreateProfile from "./create-profile";

export default async function ProfilePage() {
  const artistProfile = await getArtistProfile();
  const listenerProfile = await getListenerProfile();

  if (artistProfile) {
    return <ArtistProfile artistProfile={artistProfile} />;
  }

  // if (listenerProfile) {
  //   return <ListenerProfile listenerProfile={listenerProfile} />;
  // }

  return <CreateProfile />;
}
