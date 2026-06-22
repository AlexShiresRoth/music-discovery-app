import { getArtistProfile } from "@/lib/auth";
import { Trash, Upload } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import PrivateInfo from "./private-info";
import PublicInfo from "./public-info";
import SocialSection from "./social";

export default async function ArtistProfile() {
  const artistProfile = await getArtistProfile();

  console.log("ARTIST PROFILE", artistProfile);

  if (!artistProfile) {
    return redirect("/profile/artist/create");
  }

  return (
    <div className="flex flex-col w-full items-center py-20 min-h-screen">
      <div className="md:w-3/4 w-full flex gap-10 h-full">
        <div className="min-h-screen relative block">
          <div className="flex flex-col gap-8 items-center sticky top-0">
            {artistProfile.imageUrl && (
              <Image
                src={artistProfile.imageUrl}
                alt={artistProfile.artistName ?? "Artist Image"}
                fill
                className="w-sm h-75 object-cover rounded"
              />
            )}
            {!artistProfile.imageUrl && (
              <div className="w-sm h-75 border border-gray-400/80 rounded flex items-center justify-center">
                <p className="text-gray-400/80">Upload an image</p>
              </div>
            )}
            <div className="flex gap-8">
              <button className="p-2 border border-gray-400/80 rounded-full hover:border-indigo-500/80 transition-all text-gray-400/80 hover:text-indigo-500">
                <Upload />
              </button>
              <button className="p-2 border border-gray-400/80 rounded-full hover:border-red-500/80 transition-all text-gray-400/80 hover:text-red-500">
                <Trash />
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-10 w-full">
          <PublicInfo {...artistProfile} />
          <SocialSection {...artistProfile} />
          <PrivateInfo {...artistProfile} />
        </div>
      </div>
    </div>
  );
}
