import FeedList from "@/components/feed-list";
import IntroOverlay from "@/components/feed-overlay";
import { getSongClips } from "@/lib/auth/clips";
import { HAS_VISITED_COOKIE, hasVisitedFromCookie } from "@/lib/has-visited";
import type { Metadata } from "next";
import { cookies } from "next/headers";

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
  const cookieStore = await cookies();
  const hasVisited = hasVisitedFromCookie(
    cookieStore.get(HAS_VISITED_COOKIE)?.value,
  );

  return (
    <>
      {!hasVisited && <IntroOverlay />}
      <FeedList songClips={songClips} />
    </>
  );
}
