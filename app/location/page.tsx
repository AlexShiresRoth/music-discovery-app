import FeedList from "@/components/feed-list";
import { getProfilesWithSongClipsByLocation } from "@/lib/auth";

type Props = {
  searchParams: Promise<{ q: string; lat: string; lon: string }>;
};

// TODO - this partly works but problem is subsequent searches wont work because we redirect to same page
export default async function LocationPage({ searchParams }: Props) {
  const { q, lat, lon } = await searchParams;
  const results = await getProfilesWithSongClipsByLocation(
    parseFloat(lon),
    parseFloat(lat),
  );

  return (
    <div>
      <h1 className="md:text-2xl text-lg font-semibold">{q} & nearby</h1>
      <FeedList profiles={results} />
    </div>
  );
}
