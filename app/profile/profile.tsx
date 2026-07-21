import ProfileLinksDisplay from "@/components/profile-links-display";
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
    <div className="flex flex-col w-full items-center py-8">
      <div className="w-full flex flex-col gap-8">
        <header className="flex items-center gap-8 md:flex-row flex-col-reverse w-full">
          <div className="flex flex-col items-center">
            <div className="flex flex-col gap-8 items-center relative w-sm h-75 border rounded">
              {profile.imageUrl && (
                <Image
                  src={profile.imageUrl}
                  alt={profile.profileName ?? "Image"}
                  fill
                  loading="eager"
                  className="object-cover rounded block"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}
              <div className="md:visible hidden">
                <UploadImage
                  imageUrl={profile.imageUrl?.split("/").pop() || ""}
                />
              </div>
            </div>
            <div className="md:hidden visible">
              <UploadImage
                imageUrl={profile.imageUrl?.split("/").pop() || ""}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p>{profile.genre}</p>
            <div className="flex gap-2">
              <p>
                {profile.city} - {profile.state}
              </p>
            </div>
            <h1 className="md:text-7xl text-3xl font-bold">
              {profile.profileName}
            </h1>
            <ProfileLinksDisplay profile={profile} />
            <p className="max-w-2xl">{profile.bio}</p>
          </div>
        </header>
        <div className="flex flex-col gap-10 w-full">
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
          <PublicInfo {...profile} />
          <SocialSection {...profile} />
          <PrivateInfo {...profile} />
        </div>
      </div>
    </div>
  );
}
