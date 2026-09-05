import { getProfile, getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileWrapper from "../profile-wrapper";
import ProfileForm from "./profile-form";

export default async function CreateProfilePage() {
  const profile = await getProfile();
  if (profile) {
    return redirect("/profile");
  }
  const session = await getSession();

  return (
    <ProfileWrapper title="Create Profile">
      <ProfileForm email={session?.email ?? ""} />
    </ProfileWrapper>
  );
}
