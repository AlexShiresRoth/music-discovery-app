"use client";

import { track } from "@vercel/analytics";
import { Share2Icon } from "lucide-react";

type Props = {
  profile: {
    id: string;
    profileName: string;
    city: string;
    stateCode: string;
    imageUrl: string;
    bio: string;
  };
};
export default function ShareProfileButton({ profile }: Props) {
  const handleShare = async () => {
    const shareData = {
      title: profile.profileName,
      text: profile.bio,
      url: `${window.location.origin}/profiles/${profile.id}`,
    };
    const canNativeShare =
      typeof navigator !== "undefined" &&
      "navigator" in window &&
      typeof navigator.share === "function";

    try {
      if (canNativeShare) {
        track("share_profile_desktop", {
          profile_id: profile.id,
          name: profile.profileName,
        });
        await navigator.share(shareData);
      } else {
        track("share_profile_mobile", {
          profile_id: profile.id,
          name: profile.profileName,
        });
        await navigator.clipboard.writeText(shareData.text);
        alert("copied to clipboard!");
      }
    } catch {
      console.info("Player aborted share");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="text-sm text-gray-500 hover:cursor-pointer hover:text-gray-700 flex items-center gap-2"
    >
      <Share2Icon className="h-3 w-3" />
      Share Profile
    </button>
  );
}
