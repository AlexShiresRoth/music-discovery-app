import { getArtistProfile } from "@/lib/auth";
import PublicInfo from "../../../public-info";

export default async function EditPublicInfoModal() {
  const artistProfile = await getArtistProfile();

  if (!artistProfile) {
    return null;
  }

  return (
    <div className="w-full bg-black/50 fixed z-10 min-h-screen flex flex-col items-center justify-center">
      <div className="bg-black md:w-1/2">
        <PublicInfo {...artistProfile} mode="Edit" />
      </div>
    </div>
  );
}
