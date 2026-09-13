import FeedList from "@/components/feed-list";
import IntroOverlay from "@/components/feed-overlay";
import {
  getProfilesWithSongClips,
  getSession,
  getTotalProfilesWithSongClips,
} from "@/lib/auth";
import { HAS_VISITED_COOKIE, hasVisitedFromCookie } from "@/lib/has-visited";
import { asStringArray } from "@/lib/search-params";
import type { Metadata } from "next";
import { cookies } from "next/headers";

type Props = {
  searchParams: Promise<{
    status?: string[] | string;
  }>;
};

export const metadata: Metadata = {
  title: {
    absolute: "Side0",
  },
  description:
    "Browse independent artists and local scenes. Discover music the algorithms missed.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Side0",
    description:
      "Browse independent artists and local scenes. Discover music the algorithms missed.",
    url: "/",
  },
};

export default async function Home({ searchParams }: Props) {
  const { status } = await searchParams;
  const statusFilters = asStringArray(status);
  const user = await getSession();

  const profiles = await getProfilesWithSongClips(0, 15, statusFilters);
  const totalProfiles = await getTotalProfilesWithSongClips(statusFilters);
  const cookieStore = await cookies();
  const hasVisited = hasVisitedFromCookie(
    cookieStore.get(HAS_VISITED_COOKIE)?.value,
  );

  return (
    <>
      {!hasVisited && <IntroOverlay />}
      <FeedList
        profiles={profiles}
        totalProfiles={totalProfiles}
        isAuthenticated={!!user}
      />
    </>
  );
}
