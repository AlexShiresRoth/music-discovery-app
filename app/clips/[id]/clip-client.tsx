"use client";

import ClipFeedDisplay from "@/components/clip-feed-display";
import { FeedAudioContext } from "@/context/feed-audio";
import { SongClipWithProfile } from "@/lib/db/types";
import { useContext } from "react";

type Props = {
  clip: SongClipWithProfile;
};

export default function ClipClient({ clip }: Props) {
  const { onFinish } = useContext(FeedAudioContext);
  return (
    <ClipFeedDisplay
      clip={clip}
      index={0}
      isActive={true}
      onFinish={onFinish}
    />
  );
}
