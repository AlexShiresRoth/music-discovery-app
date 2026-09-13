"use client";

import { PROFILE_STATUS_FILTERS } from "@/constants";
import { ProfileWithSongClips } from "@/lib/db/types";
import clsx from "clsx";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import ActionButton from "./action-button";
import { SettingsModal } from "./settings-layout";

export default function StatusDisplay({
  profile,
  onPublicProfile = false,
}: {
  profile: ProfileWithSongClips;
  onPublicProfile?: boolean;
}) {
  const [showStatusModal, setShowStatusModal] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div
          className={clsx(
            "flex gap-2",
            !onPublicProfile ? "flex-col items-start" : "items-center",
          )}
        >
          {profile.openToCollaboration && (
            <p
              className={clsx(
                "text-xs font-bold uppercase",
                onPublicProfile ? "text-amber-700" : "text-gray-500",
              )}
            >
              {PROFILE_STATUS_FILTERS.openToCollaboration.label}
            </p>
          )}
          {profile.openToGigs && onPublicProfile && (
            <span className="text-gray-500/50 text-xs">|</span>
          )}
          {profile.openToGigs && (
            <p
              className={clsx(
                "text-xs font-bold uppercase",
                onPublicProfile ? "text-amber-700" : "text-gray-500",
              )}
            >
              {PROFILE_STATUS_FILTERS.openToGigs.label}
            </p>
          )}
          {profile.needActForShow && onPublicProfile && (
            <span className="text-gray-500/50 text-xs">|</span>
          )}
          {profile.needActForShow && (
            <p
              className={clsx(
                "text-xs font-bold uppercase",
                onPublicProfile ? "text-amber-700" : "text-gray-500",
              )}
            >
              {PROFILE_STATUS_FILTERS.needActForShow.label}
            </p>
          )}
          {profile.statusMessage && !onPublicProfile && (
            <div className="my-2">
              <button
                type="button"
                className="hover:cursor-pointer text-amber-700 transition-colors duration-300"
                onClick={() => {
                  setShowStatusModal(true);
                }}
              >
                <p className="text-xs flex items-center gap-2">
                  <MessageCircle className="w-3 h-3" /> View Status Message
                </p>
              </button>
              {showStatusModal && (
                <SettingsModal
                  title={`A message from ${profile.profileName}`}
                  onClose={() => setShowStatusModal(false)}
                  actions={
                    <ActionButton onClick={() => setShowStatusModal(false)}>
                      Close
                    </ActionButton>
                  }
                >
                  <div className="border p-4 rounded">
                    <p>{`"${profile.statusMessage}"`}</p>
                  </div>
                </SettingsModal>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
