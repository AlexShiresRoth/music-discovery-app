import { getArtistProfile } from "@/lib/auth";
import PrivateInfo from "../../private-info";

export default async function EditPrivateInfo() {
  const artistProfile = await getArtistProfile();

  if (!artistProfile) {
    return null;
  }
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="bg-black md:w-1/2">
        <PrivateInfo {...artistProfile} mode="Edit" />
      </div>
    </div>
  );
}
