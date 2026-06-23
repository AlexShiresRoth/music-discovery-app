import { getArtistProfile } from "@/lib/auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import PrivateInfo from "./private-info";
import PublicInfo from "./public-info";
import SocialSection from "./social";
import UploadImage from "./upload-image";

export default async function ArtistProfile() {
  const artistProfile = await getArtistProfile();

  if (!artistProfile) {
    return redirect("/profile/artist/create");
  }

  return (
    <div className="flex flex-col w-full items-center py-20 min-h-screen">
      <div className="md:w-3/4 w-full flex gap-10 h-full">
        <div className="min-h-screen relative block">
          <div className="sticky top-0">
            {artistProfile.imageUrl && (
              <div className="flex flex-col gap-8 items-center relative w-sm h-75 border border-gray-400/80 rounded">
                <Image
                  src={artistProfile.imageUrl}
                  alt={artistProfile.artistName ?? "Artist Image"}
                  fill
                  loading="eager"
                  className="object-cover rounded block"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
            {!artistProfile.imageUrl && (
              <div className="w-sm h-75 border border-gray-400/80 rounded flex items-center justify-center">
                <p className="text-gray-400/80">Upload an image</p>
              </div>
            )}
            <UploadImage
              imageUrl={artistProfile.imageUrl?.split("/").pop() || ""}
            />
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
