import { ProfileWithSongClips, SongClipWithProfile } from "@/lib/db/types";
import { formatPublishedAt } from "@/lib/format-relative-time";
import clsx from "clsx";
import { ArrowRight, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import EmptyState from "./empty-state";
import ProfileLocationDisplay from "./profile-location-display";
import ReportAccount from "./report-account";
import StatusDisplay from "./status-display";

type Props = {
  profile: ProfileWithSongClips;
  songClips: SongClipWithProfile[];
  clipIndex: number;
  setClipIndex: (index: number) => void;
  scrollToClip: (index: number) => void;
  advanceToNextProfile: (index: number) => void;
  currentIndex: number;
  totalProfiles: number;
  isActive: boolean;
  isAuthenticated: boolean;
};

export default function ArtistColumn({
  profile,
  songClips,
  clipIndex,
  setClipIndex,
  scrollToClip,
  advanceToNextProfile,
  currentIndex,
  totalProfiles,
  isActive,
  isAuthenticated,
}: Props) {
  const published = formatPublishedAt(profile.updatedAt);
  const hasStatus =
    profile.statusMessage ||
    profile.openToCollaboration ||
    profile.openToGigs ||
    profile.needActForShow;
  return (
    <aside
      className={clsx(
        "flex flex-col md:border-r border-r-black/10 pr-8 md:gap-12 gap-4 opacity-60",
        isActive ? "animate-light-fade-in" : "animate-light-fade-out",
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="relative w-20 h-20 md:w-70 md:h-60 overflow-hidden rounded border">
          {profile.imageUrl && (
            <>
              <Image
                src={profile.imageUrl}
                alt={profile.profileName ?? "Profile Image"}
                fill
                loading="eager"
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="w-full h-full absolute inset-0 bg-black/50 rounded animate-pulse -z-10" />
            </>
          )}
          {!profile.imageUrl && (
            <EmptyState
              message="No Image Yet."
              icon={<ImageIcon className="w-10 h-10" />}
            />
          )}
        </div>
        <div className="flex flex-col md:gap-2">
          <Link
            href={`/profiles/${profile.id}`}
            className="text-3xl md:text-4xl md:w-70 w-full font-bold text-black uppercase hover:underline underline-offset-4 decoration-black"
          >
            {profile.profileName}
          </Link>
          <div className="flex flex-col">
            <ProfileLocationDisplay
              city={profile.city}
              stateCode={profile.stateCode}
              lat={profile.lat}
              lon={profile.lon}
              className="text-sm text-gray-500 hover:underline underline-offset-4 decoration-black"
            />
          </div>
          {published && (
            <div className="flex flex-col">
              <p className="text-sm text-gray-500">{published.label}</p>
            </div>
          )}
          <ReportAccount
            isAuthenticated={isAuthenticated}
            profileId={profile.id}
          />
        </div>
      </div>

      <div className="flex-col gap-2 md:flex hidden">
        <div className="flex flex-col border-b border-b-black/10 pb-2">
          <p className="font-semibold text-lg">Clips</p>
        </div>
        <div className="flex flex-col gap-2">
          {songClips.length > 0 &&
            songClips.map((clip, index) => (
              <div key={clip.id}>
                <button
                  type="button"
                  className={clsx(
                    "hover:cursor-pointer hover:text-amber-700 transition-colors duration-300 flex items-center gap-2 relative",
                    clipIndex === index ? "text-amber-700" : "text-gray-500",
                  )}
                  onClick={() => {
                    setClipIndex(index);
                    scrollToClip(index);
                  }}
                >
                  <div
                    className={clsx(
                      "w-2 h-2 shrink-0 transition-opacity duration-300 block bg-amber-700 rounded-full",
                      clipIndex !== index && "opacity-0 animate-none",
                      clipIndex === index && "animate-pulse",
                    )}
                    aria-hidden={clipIndex !== index}
                  />
                  {clip.title}
                </button>
              </div>
            ))}
        </div>
      </div>
      {hasStatus && (
        <div className="flex-col gap-2 flex">
          <div className="flex flex-col border-b border-b-black/10 md:pb-2">
            <p className="font-semibold md:text-lg text-sm">Status</p>
          </div>
          <div className="flex flex-col md:ml-4">
            <StatusDisplay profile={profile} />
          </div>
        </div>
      )}
      <div className="flex-col h-full justify-end py-4 md:flex hidden">
        <p className="text-sm text-gray-500">
          Artist {currentIndex + 1} of {totalProfiles}
        </p>
        {currentIndex < totalProfiles - 1 && (
          <button
            type="button"
            onClick={() => advanceToNextProfile(currentIndex + 1)}
            className="hover:cursor-pointer text-gray-400 hover:text-amber-700 transition-colors duration-300 flex items-center gap-2"
          >
            Next Artist <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </aside>
  );
}
