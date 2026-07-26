import FeedList from "@/components/feed-list";
import { getProfilesWithSongClips } from "@/lib/auth";

type Props = {
  searchParams: Promise<{
    g?: string;
  }>;
};

export default async function Home({ searchParams }: Props) {
  const { g } = await searchParams;
  const profiles = await getProfilesWithSongClips(
    0,
    15,
    g === "None" ? undefined : g,
  );

  return <FeedList profiles={profiles} />;
}
