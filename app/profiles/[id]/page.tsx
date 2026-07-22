import ProfileLinksDisplay from "@/components/profile-links-display";
import PublicSongClips from "@/components/public-song-clips";
import { getProfileById } from "@/lib/auth";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = await getProfileById(id);

  if (!profile) {
    return notFound();
  }

  return (
    <div className="flex flex-col w-full items-center py-8">
      <div className="w-full flex flex-col gap-8">
        <header className="flex items-center gap-8 md:flex-row flex-col-reverse w-full">
          <div className="flex flex-col items-center w-full md:w-auto">
            <div className="flex flex-col gap-8 items-center relative w-full md:w-sm h-75 border rounded">
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
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p>{profile.genre}</p>
            <div className="flex gap-2">
              <p>{profile.location?.formattedLocation}</p>
            </div>
            <h1 className="md:text-7xl text-3xl font-bold">
              {profile.profileName}
            </h1>
            <ProfileLinksDisplay profile={profile} />
            <p className="max-w-2xl">{profile.bio}</p>
          </div>
        </header>

        {profile.songClips.length > 0 && (
          <PublicSongClips clips={profile.songClips} />
        )}
      </div>
    </div>
  );
}
