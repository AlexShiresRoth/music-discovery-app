import BackButton from "@/components/breadcrumbs";
import FeedList from "@/components/feed-list";
import {
  getProfilesWithSongClipsByQuery,
  getTotalProfilesWithSongClips,
} from "@/lib/auth";
import type { Metadata } from "next";

type Props = {
  searchParams: Promise<{
    q: string;
  }>;
};

export const metadata: Metadata = {
  title: "Search artists",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function ArtistsPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const profiles = await getProfilesWithSongClipsByQuery(q);
  const totalProfiles = await getTotalProfilesWithSongClips();
  return (
    <div>
      <div className="w-full flex justify-between items-center">
        <h1 className="md:text-2xl text-lg font-semibold">{q}</h1>
        <BackButton />
      </div>
      <FeedList
        profiles={profiles}
        searchTerm={q}
        totalProfiles={totalProfiles}
      />
    </div>
  );
}
