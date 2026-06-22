import { getArtistProfile } from "@/lib/auth";
import PublicInfo from "../../public-info";

export default async function EditArtistProfile() {
  const artistProfile = await getArtistProfile();

  if (!artistProfile) {
    return null;
  }
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="bg-black md:w-1/2">
        <PublicInfo {...artistProfile} mode="Edit" />
      </div>
    </div>
  );
}
