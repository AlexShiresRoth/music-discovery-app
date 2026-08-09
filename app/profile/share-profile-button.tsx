"use client";

import { track } from "@vercel/analytics";
import { Share2Icon } from "lucide-react";

type Props = {
  profile: {
    id: string;
    profileName: string;
    bio: string;
  };
};

export default function ShareProfileButton({ profile }: Props) {
  const handleShare = async () => {
    const url = `${window.location.origin}/profiles/${profile.id}`;
    const shareData = {
      title: profile.profileName,
      text: profile.bio || profile.profileName,
      url,
    };
    const canNativeShare =
      typeof navigator !== "undefined" && typeof navigator.share === "function";

    try {
      if (canNativeShare) {
        track("share_profile", {
          profile_id: profile.id,
          name: profile.profileName,
        });
        await navigator.share(shareData);
      } else {
        track("share_profile_clipboard", {
          profile_id: profile.id,
          name: profile.profileName,
        });
        await navigator.clipboard.writeText(url);
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
      className="text-sm text-gray-500 hover:cursor-pointer hover:text-gray-700 flex items-center gap-2"
    >
      <Share2Icon className="h-3 w-3" />
      Share Profile
    </button>
  );
}
