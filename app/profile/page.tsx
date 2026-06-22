import { getArtistProfile, getListenerProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChooseProfile from "./intro";

export default async function ProfilePage() {
  const artistProfile = await getArtistProfile();

  console.log("ARTIST PROFILE", artistProfile);

  if (artistProfile) {
    return redirect("/profile/artist");
  }

  const listenerProfile = await getListenerProfile();

  if (listenerProfile) {
    return redirect("/profile/listener");
  }

  return <ChooseProfile />;
}
