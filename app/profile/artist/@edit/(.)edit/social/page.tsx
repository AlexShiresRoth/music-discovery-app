import { getArtistProfile } from "@/lib/auth";
import SocialSection from "../../../social";

export default async function EditSocialLinksModal() {
  const artistProfile = await getArtistProfile();

  if (!artistProfile) {
    return null;
  }

  return (
    <div className="w-full bg-black/50 fixed py-12 h-screen flex flex-col items-center justify-center">
      <div className="bg-black md:w-1/2">
        <SocialSection {...artistProfile} mode="Edit" />
      </div>
    </div>
  );
}
