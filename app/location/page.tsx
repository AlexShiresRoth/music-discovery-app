import BackButton from "@/components/breadcrumbs";
import FeedList from "@/components/feed-list";
import {
  getProfilesWithSongClipsByLocation,
  getSession,
  getTotalProfilesWithSongClipsByLocation,
} from "@/lib/auth";
import { asStringArray } from "@/lib/search-params";
import type { Metadata } from "next";

type Props = {
  searchParams: Promise<{
    q?: string;
    lat: string;
    lon: string;
    status?: string[] | string;
  }>;
};

export const metadata: Metadata = {
  title: "Artists nearby",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function LocationPage({ searchParams }: Props) {
  const { q, lat, lon, status } = await searchParams;
  const statusFilters = asStringArray(status);
  const results = await getProfilesWithSongClipsByLocation(
    parseFloat(lon),
    parseFloat(lat),
    statusFilters,
  );

  const totalProfiles = await getTotalProfilesWithSongClipsByLocation(
    parseFloat(lon),
    parseFloat(lat),
    statusFilters,
  );

  const user = await getSession();

  return (
    <div>
      <div className="w-full flex justify-between items-center">
        <h1 className="md:text-2xl text-lg font-semibold">
          {q ? `Listening near ${q}` : "Listening to artists nearby"}
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
