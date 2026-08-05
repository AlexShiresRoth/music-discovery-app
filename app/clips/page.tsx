import FeedList from "@/components/feed-list";
import { getSongClips } from "@/lib/auth/clips";

type Props = {
  searchParams: Promise<{
    g?: string[] | string;
  }>;
};

export default async function ClipsPage({ searchParams }: Props) {
  const { g } = await searchParams;

  const songClips = await getSongClips(
    Array.isArray(g) ? g : g ? [g] : undefined,
  );

  return <FeedList songClips={songClips} />;
}
