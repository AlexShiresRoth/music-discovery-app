import { getArtistProfile } from "@/lib/auth";
import SocialSection from "../../social";

export default async function EditSocialLinks() {
  const artistProfile = await getArtistProfile();

  if (!artistProfile) {
    return null;
  }
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="bg-black md:w-1/2">
        <SocialSection {...artistProfile} mode="Edit" />
      </div>
    </div>
  );
}
