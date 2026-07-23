import FeedList from "@/components/feed-list";
import { getProfilesWithSongClips } from "@/lib/auth";

export default async function Home() {
  const profiles = await getProfilesWithSongClips();

  return <FeedList profiles={profiles} />;
}
