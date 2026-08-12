import FeedList from "@/components/feed-list";
import IntroOverlay from "@/components/feed-overlay";
import {
  getProfilesWithSongClips,
  getTotalProfilesWithSongClips,
} from "@/lib/auth";
import { HAS_VISITED_COOKIE, hasVisitedFromCookie } from "@/lib/has-visited";
import type { Metadata } from "next";
import { cookies } from "next/headers";

type Props = {
  searchParams: Promise<{
    g?: string[] | string;
  }>;
};

export const metadata: Metadata = {
  title: {
    absolute: "Music Discovery App",
  },
  description:
    "Browse independent artists and local scenes. Discover music the algorithms missed.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Music Discovery App",
    description:
      "Browse independent artists and local scenes. Discover music the algorithms missed.",
    url: "/",
  },
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
  const cookieStore = await cookies();
  const hasVisited = hasVisitedFromCookie(
    cookieStore.get(HAS_VISITED_COOKIE)?.value,
  );

  return (
    <>
      {!hasVisited && <IntroOverlay />}
      <FeedList profiles={profiles} totalProfiles={totalProfiles} />
    </>
  );
}
