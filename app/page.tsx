import FeedList from "@/components/feed-list";
import {
  getProfilesWithSongClips,
  getTotalProfilesWithSongClips,
} from "@/lib/auth";

type Props = {
  searchParams: Promise<{
    g?: string[] | string;
  }>;
};

export default async function Home({ searchParams }: Props) {
  const { g } = await searchParams;

  const profiles = await getProfilesWithSongClips(
    0,
    15,
    Array.isArray(g) ? g : g ? [g as string] : [],
  );
  const totalProfiles = await getTotalProfilesWithSongClips(
    Array.isArray(g) ? g : g ? [g as string] : [],
  );

  return <FeedList profiles={profiles} totalProfiles={totalProfiles} />;
}
