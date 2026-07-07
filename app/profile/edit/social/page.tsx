import { getProfile } from "@/lib/auth";
import SocialSection from "../../social";

export default async function EditSocialLinks() {
  const profile = await getProfile();

  if (!profile) {
    return null;
  }
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="bg-black md:w-1/2">
        <SocialSection {...profile} mode="Edit" />
      </div>
    </div>
  );
}
