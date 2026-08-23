import BackButton from "@/components/breadcrumbs";
import FeedList from "@/components/feed-list";
import {
  getProfilesWithSongClipsByLocation,
  getSession,
  getTotalProfilesWithSongClipsByLocation,
} from "@/lib/auth";
import type { Metadata } from "next";

type Props = {
  searchParams: Promise<{ q: string; lat: string; lon: string }>;
};

export const metadata: Metadata = {
  title: "Artists nearby",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function LocationPage({ searchParams }: Props) {
  const { q, lat, lon } = await searchParams;
  const results = await getProfilesWithSongClipsByLocation(
    parseFloat(lon),
    parseFloat(lat),
  );

  const totalProfiles = await getTotalProfilesWithSongClipsByLocation(
    parseFloat(lon),
    parseFloat(lat),
  );

  const user = await getSession();

  return (
    <div>
      <div className="w-full flex justify-between items-center">
        <h1 className="md:text-4xl text-lg font-semibold">
          {q ? `Listening in ${q} & nearby` : "Listening to artists nearby"}
        </h1>
        <BackButton />
      </div>
      <FeedList
        profiles={results}
        searchTerm={q}
        totalProfiles={totalProfiles}
        isAuthenticated={!!user}
      />
    </div>
  );
}
