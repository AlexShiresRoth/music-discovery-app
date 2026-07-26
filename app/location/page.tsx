import FeedList from "@/components/feed-list";
import { getProfilesWithSongClipsByLocation } from "@/lib/auth";

type Props = {
  searchParams: Promise<{ q: string; lat: string; lon: string; g: string }>;
};

export default async function LocationPage({ searchParams }: Props) {
  const { q, lat, lon, g } = await searchParams;
  const results = await getProfilesWithSongClipsByLocation(
    parseFloat(lon),
    parseFloat(lat),
    g === "None" ? undefined : g,
  );

  return (
    <div>
      <h1 className="md:text-2xl text-lg font-semibold">{q} & nearby</h1>
      <FeedList profiles={results} />
    </div>
  );
}
