import FeedList from "@/components/feed-list";
import { getProfilesWithSongClipsByQuery } from "@/lib/auth";

type Props = {
  searchParams: Promise<{
    q: string;
  }>;
};
export default async function ArtistsPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const profiles = await getProfilesWithSongClipsByQuery(q);
  return (
    <div>
      <h1 className="md:text-2xl text-lg font-semibold">{q}</h1>
      <FeedList profiles={profiles} />
    </div>
  );
}
