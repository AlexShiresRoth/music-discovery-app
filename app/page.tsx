import FeedList from "@/components/feed-list";
import { getProfilesWithSongClips } from "@/lib/auth";
import { ProfileWithSongClips } from "@/lib/db/types";
import { mockProfiles } from "@/lib/mock-profiles";
import { randomUUID } from "crypto";

export default async function Home() {
  const profiles = await getProfilesWithSongClips();
  const displayProfiles = [
    ...profiles,
    ...mockProfiles.map((profile) => ({
      ...profile,
      songClips: profiles[0].songClips.map((clip) => ({
        ...clip,
        full_song_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        id: randomUUID(),
      })),
    })),
  ] as ProfileWithSongClips[];

  return <FeedList profiles={displayProfiles} />;
}
