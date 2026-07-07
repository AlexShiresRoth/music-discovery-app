import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileWrapper from "../profile-wrapper";
import ProfileForm from "./profile-form";

export default async function CreateProfilePage() {
  const profile = await getProfile();
  if (profile) {
    return redirect("/profile");
  }
  return (
    <ProfileWrapper title="Create Profile">
      <ProfileForm />
    </ProfileWrapper>
  );
}
