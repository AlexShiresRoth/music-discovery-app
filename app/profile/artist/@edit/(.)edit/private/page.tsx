import { getArtistProfile } from "@/lib/auth";
import PrivateInfo from "../../../private-info";

export default async function EditPrivateInfoModal() {
  const artistProfile = await getArtistProfile();

  if (!artistProfile) {
    return null;
  }

  return (
    <div className="w-full bg-black/50 fixed min-h-screen flex flex-col items-center justify-center">
      <div className="bg-black md:w-1/2 max-h-3/4 overflow-y-auto">
        <PrivateInfo {...artistProfile} mode="Edit" />
      </div>
    </div>
  );
}
