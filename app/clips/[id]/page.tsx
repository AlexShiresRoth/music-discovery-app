import FeedAudioControls from "@/components/audio-controls";
import FeedAudioProvider from "@/context/feed-audio";
import { getProfileById } from "@/lib/auth";
import { getSongClipsByIds } from "@/lib/db/song-clips";
import { SongClipWithProfile } from "@/lib/db/types";
import ClipClient from "./clip-client";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClipPage({ params }: Props) {
  const { id } = await params;
  const clips = await getSongClipsByIds([id]);

  if (!clips.length) {
    return <div>Clip not found</div>;
  }

  const clip = clips[0];

  const profile = await getProfileById(clip.profileRefId);

  if (!profile) {
    return <div>Profile not found</div>;
  }

  const clipWithProfile: SongClipWithProfile = {
    ...clip,
    profileName: profile.profileName ?? "",
    profileId: profile.id,
    profileImage: profile.imageUrl ?? "",
  };

  return (
    <main>
      <FeedAudioProvider>
        <ClipClient clip={clipWithProfile} />
        <FeedAudioControls />
      </FeedAudioProvider>
    </main>
  );
}
