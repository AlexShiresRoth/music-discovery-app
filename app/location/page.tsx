import BackButton from "@/components/breadcrumbs";
import FeedList from "@/components/feed-list";
import {
  getProfilesWithSongClipsByLocation,
  getTotalProfilesWithSongClipsByLocation,
} from "@/lib/auth";

type Props = {
  searchParams: Promise<{ q: string; lat: string; lon: string }>;
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

  return (
    <div>
      <div className="w-full flex justify-between items-center">
        <h1 className="md:text-2xl text-lg font-semibold">{q} & nearby</h1>
        <BackButton />
      </div>
      <FeedList
        profiles={results}
        searchTerm={q}
        totalProfiles={totalProfiles}
      />
    </div>
  );
}
