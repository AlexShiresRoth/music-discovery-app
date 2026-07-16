import type { Profile, SongClip } from "@/lib/db/types";
import Image from "next/image";
import Link from "next/link";
import PrivateInfo from "./private-info";
import PublicInfo from "./public-info";
import SocialSection from "./social";
import SongClipsSection from "./song-clips";
import UploadImage from "./upload-image";

type Props = {
  profile: Profile;
  clips: SongClip[];
};

export default async function Profile({ profile, clips }: Props) {
  const isVerified = profile.isVerified;
  return (
    <div className="flex flex-col w-full items-center p-8">
      <div className="w-full flex flex-col gap-8">
        <header className="flex items-center gap-8 w-full justify-between">
          {!isVerified && (
            <Link
              href="/profile/verify"
              className="text-white px-4 py-2 rounded-md bg-gray-700/10 border hover:cursor-pointer  transition-all"
            >
              Get Verified
            </Link>
          )}
          {isVerified && (
            <SongClipsSection clips={clips} isVerified={isVerified ?? false} />
          )}
        </header>
        <div className="w-full flex gap-10 h-full">
          <div className="min-h-screen relative block">
            <div className="sticky top-0">
              {profile.imageUrl && (
                <div className="flex flex-col gap-8 items-center relative w-sm h-75 border rounded">
                  <Image
                    src={profile.imageUrl}
                    alt={profile.profileName ?? "Image"}
                    fill
                    loading="eager"
                    className="object-cover rounded block"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              {!profile.imageUrl && (
                <div className="w-sm h-75 border rounded flex items-center justify-center">
                  <p className="text-gray-400/80">Upload an image</p>
                </div>
              )}
              <UploadImage
                imageUrl={profile.imageUrl?.split("/").pop() || ""}
              />
            </div>
          </div>
          <div className="flex flex-col gap-10 w-full">
            <PublicInfo {...profile} />
            <SocialSection {...profile} />
            <PrivateInfo {...profile} />
          </div>
        </div>
      </div>
    </div>
  );
}
