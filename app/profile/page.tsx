import { getProfile } from "@/lib/auth";
import ChooseProfile from "./intro";
import Profile from "./profile";

export default async function ProfilePage() {
  const profile = await getProfile();

  if (profile) {
    return <Profile profile={profile} />;
  }

  return <ChooseProfile />;
}
