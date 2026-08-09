import ShareProfileButton from "@/app/profile/share-profile-button";
import BackButton from "@/components/breadcrumbs";
import EmptyState from "@/components/empty-state";
import ProfileLinksDisplay from "@/components/profile-links-display";
import ProfileLocationDisplay from "@/components/profile-location-display";
import PublicSongClips from "@/components/public-song-clips";
import { getProfileById } from "@/lib/auth";
import { ImageIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

function profileDescription(profile: {
  bio: string | null;
  city: string;
  stateCode: string;
  profileName: string | null;
}) {
  const location = [profile.city, profile.stateCode].filter(Boolean).join(", ");
  const bio = profile.bio?.trim();
  if (bio) {
    return bio.length > 160 ? `${bio.slice(0, 157)}...` : bio;
  }
  if (location) {
    return `${profile.profileName ?? "Artist"} · ${location}`;
  }
  return "Discover independent artists and local scenes.";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfileById(id);

  if (!profile) {
    return {
      title: "Profile not found",
    };
  }

  const name = profile.profileName?.trim() || "Artist";
  const description = profileDescription(profile);
  const images = profile.imageUrl
    ? [
        {
          url: profile.imageUrl,
          alt: name,
        },
      ]
    : undefined;

  return {
    title: name,
    description,
    alternates: {
      canonical: `/profiles/${id}`,
    },
    openGraph: {
      title: name,
      description,
      url: `/profiles/${id}`,
      type: "profile",
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: name,
      description,
      images: images?.map((image) => image.url),
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = await getProfileById(id);

  if (!profile) {
    return notFound();
  }

  return (
    <div className="flex flex-col w-full items-center py-8">
      <div className="w-full flex flex-col gap-8">
        <div className="self-end">
          <BackButton />
        </div>
        <header className="flex md:items-center gap-8 md:flex-row flex-col-reverse w-full">
          <div className="flex flex-col items-center w-full md:w-auto">
            <div className="flex flex-col gap-8 items-center relative w-full md:w-sm h-75 border rounded">
              {profile.imageUrl ? (
                <Image
                  src={profile.imageUrl}
                  alt={profile.profileName ?? "Image"}
                  fill
                  loading="eager"
                  className="object-cover rounded block"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <EmptyState
                  message="No Image Yet."
                  icon={<ImageIcon className="w-10 h-10" />}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <ProfileLocationDisplay
                city={profile.city}
                stateCode={profile.stateCode}
              />
            </div>
            <h1 className="md:text-7xl text-3xl font-bold">
              {profile.profileName}
            </h1>
            <ProfileLinksDisplay profile={profile} />
            {profile.influences.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-bold">Influences</p>
                <div className="flex flex-wrap gap-2">
                  {profile.influences.map((influence) => (
                    <div key={influence} className="text-sm">
                      {influence}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {profile.bio ? (
              <div>
                <p className="text-sm font-bold">Bio</p>
                <p className="max-w-2xl">{profile.bio}</p>
              </div>
            ) : (
              <EmptyState
                message="No Bio Yet."
                className="items-start h-auto"
              />
            )}
            <div>
              <ShareProfileButton
                profile={{
                  id: profile.id.toString(),
                  profileName: profile.profileName ?? "",
                  bio: profile.bio ?? "",
                }}
              />
            </div>
          </div>
        </header>

        <PublicSongClips clips={profile.songClips} />
      </div>
    </div>
  );
}
