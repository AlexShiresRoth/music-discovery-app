"use client";

import { track } from "@vercel/analytics";
import { Share2Icon } from "lucide-react";

type Payload = Record<string, string>;

type TrackEvent = {
  name: string;
  payload: Payload;
};

type Props = {
  shareUrl: string;
  shareTitle: string;
  shareText: string;
  canShareTrackEvent: TrackEvent;
  clipboardShareTrackEvent: TrackEvent;
  shareButtonText: string;
};

export default function ShareButton({
  shareUrl,
  shareTitle,
  shareText,
  canShareTrackEvent,
  clipboardShareTrackEvent,
  shareButtonText,
}: Props) {
  const handleShare = async () => {
    const shareData = {
      title: shareTitle,
      text: shareText,
      url: shareUrl,
    };
    const canNativeShare =
      typeof navigator !== "undefined" && typeof navigator.share === "function";

    try {
      if (canNativeShare) {
        track(canShareTrackEvent.name, {
          ...canShareTrackEvent.payload,
        });
        await navigator.share(shareData);
      } else {
        track(clipboardShareTrackEvent.name, {
          ...clipboardShareTrackEvent.payload,
        });
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      }
    } catch {
      console.info("Player aborted share");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="text-xs text-gray-500 hover:cursor-pointer hover:text-gray-700 flex items-center gap-2"
    >
      <Share2Icon className="h-3 w-3" />
      {shareButtonText}
    </button>
  );
}
