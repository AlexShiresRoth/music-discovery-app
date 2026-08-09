import FeedList from "@/components/feed-list";
import { getSongClips } from "@/lib/auth/clips";
import type { Metadata } from "next";

type Props = {
  searchParams: Promise<{
    g?: string[] | string;
  }>;
};

export const metadata: Metadata = {
  title: "Clips",
  description:
    "Listen through short clips from independent artists and local scenes.",
  alternates: {
    canonical: "/clips",
  },
  openGraph: {
    title: "Clips",
    description:
      "Listen through short clips from independent artists and local scenes.",
    url: "/clips",
  },
};

export default async function ClipsPage({ searchParams }: Props) {
  const { g } = await searchParams;

  const songClips = await getSongClips(
    Array.isArray(g) ? g : g ? [g] : undefined,
  );

  return <FeedList songClips={songClips} />;
}
