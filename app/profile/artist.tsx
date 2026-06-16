import { type ArtistProfile } from "@/lib/db/types";
import { Trash, Upload } from "lucide-react";
import Image from "next/image";
import ToggleButton from "./toggle";

type Props = {
  artistProfile: ArtistProfile;
};

function PreHeader({ children }: { children: React.ReactNode }) {
  return <p className="text-sm uppercase">{children}</p>;
}

function SocialLink({
  link,
  platform,
  fallback,
}: {
  link: string | null;
  platform: string;
  fallback: string;
}) {
  return (
    <div className="flex gap-2 items-center justify-between border-b border-gray-400/80 pb-4">
      <div className="flex flex-col gap-2">
        <PreHeader>{platform}</PreHeader>
        <div className="flex justify-start w-full">
          {link ? (
            <p className="text-lg text-gray-400/80">{link}</p>
          ) : (
            <p className="text-lg text-gray-400/50">{fallback}</p>
          )}
        </div>
      </div>
      {link && (
        <div className="flex flex-col gap-2">
          <PreHeader>Toggle</PreHeader>
          <ToggleButton />
        </div>
      )}
    </div>
  );
}

export default function ArtistProfile({ artistProfile }: Props) {
  const {
    artistDescription,
    artistLogo,
    artistName,
    genre,
    imageUrl,
    city,
    state,
    country,
    website,
    facebook,
    instagram,
    tiktok,
    spotify,
    appleMusic,
    soundcloud,
    contactEmail,
    fullName,
    joinedDate,
    membersWithAccess,
    members,
  } = artistProfile;

  return (
    <div className="flex flex-col w-full items-center py-20 min-h-screen">
      <div className="md:w-3/4 w-full flex gap-10 h-full">
        <div className="min-h-screen relative block">
          <div className="flex flex-col gap-8 items-center sticky top-0">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={artistName ?? "Artist Image"}
                fill
                className="w-sm h-[300px] object-cover rounded"
              />
            )}
            {!imageUrl && (
              <div className="w-sm h-[300px] border border-gray-400/80 rounded flex items-center justify-center">
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
          <div className="flex flex-col gap-10 w-full border border-gray-400/80 rounded-md p-8">
            <div>
              <h2 className="font-bold uppercase text-indigo-500">
                Public Info
              </h2>
            </div>
            <header className="flex justify-between gap-2 border-b border-gray-400/80 pb-4">
              <div className="flex flex-col">
                <PreHeader>Artist Name</PreHeader>
                <h1 className="text-3xl font-bold uppercase">{artistName}</h1>
              </div>
              <div>
                {artistLogo ? (
                  <Image
                    src={artistLogo}
                    alt={artistName ?? "Artist Logo"}
                    fill
                    className="w-20 h-20 object-cover rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 border border-gray-400/80 rounded-full" />
                )}
              </div>
            </header>
            <div className="flex flex-col border-b border-gray-400/80 pb-4">
              <PreHeader>Genre</PreHeader>
              <p className="text-lg">{genre}</p>
            </div>
            <div className="flex flex-col border-b border-gray-400/80 pb-4">
              <PreHeader>Members</PreHeader>
              <p className="text-lg">{members.join(", ")}</p>
            </div>
            <div className="border-b border-gray-400/80 pb-4">
              <PreHeader>Bio</PreHeader>
              <p className="text-lg">{artistDescription}</p>
            </div>
            <div className="flex flex-col gap-2 border-b border-gray-400/80 pb-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <PreHeader>City</PreHeader>
                  <p className="text-lg">{city}</p>
                </div>
                <div>
                  <PreHeader>State</PreHeader>
                  <p className="text-lg">{state}</p>
                </div>
                <div>
                  <PreHeader>Country</PreHeader>
                  <p className="text-lg">{country}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-10 w-full border border-gray-400/80 rounded-md p-8">
            <h2 className="font-bold uppercase text-indigo-500">
              Social Links
            </h2>
            <SocialLink
              link={website}
              platform="Website"
              fallback="www.mywebsite.com"
            />
            <SocialLink
              link={facebook}
              platform="Facebook"
              fallback="www.facebook.com/myartist"
            />
            <SocialLink
              link={instagram}
              platform="Instagram"
              fallback="www.instagram.com/myartist"
            />
            <SocialLink
              link={tiktok}
              platform="TikTok"
              fallback="www.tiktok.com/myartist"
            />
            <SocialLink
              link={spotify}
              platform="Spotify"
              fallback="www.spotify.com/myartist"
            />
            <SocialLink
              link={appleMusic}
              platform="Apple Music"
              fallback="www.applemusic.com/myartist"
            />
            <SocialLink
              link={soundcloud}
              platform="SoundCloud"
              fallback="www.soundcloud.com/myartist"
            />
          </div>
          <div className="flex flex-col gap-10 w-full border border-gray-400/80 rounded-md p-8">
            <h2 className="font-bold uppercase text-indigo-500">
              Private Info
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <PreHeader>Full Name</PreHeader>
                <p className="text-lg">{fullName}</p>
              </div>
              <div>
                <PreHeader>Contact Email</PreHeader>
                <p className="text-lg">{contactEmail}</p>
              </div>
              <div>
                <PreHeader>Joined Date</PreHeader>
                <p className="text-lg">{joinedDate?.toLocaleDateString()}</p>
              </div>
              <div>
                <PreHeader>Members with Access</PreHeader>
                <p className="text-lg">{membersWithAccess.join(", ")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
