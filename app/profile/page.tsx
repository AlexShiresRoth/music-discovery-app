import { getArtistProfile, getListenerProfile, getSession } from "@/lib/auth";
import CreateProfile from "./create-profile";

export default async function ProfilePage() {
  const session = await getSession();
  const artistProfile = await getArtistProfile();
  const listenerProfile = await getListenerProfile();

  if (!artistProfile && !listenerProfile) {
    return <CreateProfile userId={session?.user.id ?? ""} />;
  }

  return <div>Profile</div>;
}
