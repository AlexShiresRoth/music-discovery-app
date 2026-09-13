"use client";

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
  const cols = [
    profile.openToCollaboration,
    profile.openToGigs,
    profile.needActForShow,
  ].filter(Boolean).length;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {onPublicProfile && <h2 className="font-bold uppercase">Status</h2>}
        <div
          className={clsx(
            onPublicProfile && "grid grid-cols-1 w-full gap-4",
            onPublicProfile && cols === 1 && "md:grid-cols-1",
            onPublicProfile && cols === 2 && "md:grid-cols-2",
            onPublicProfile && cols === 3 && "md:grid-cols-3",
          )}
        >
          {profile.openToCollaboration && (
            <div
              className={clsx(
                onPublicProfile &&
                  "p-4 bg-indigo-500/20 border-2 border-b-4 rounded",
              )}
            >
              <p
                className={clsx(
                  "text-xs font-bold uppercase",
                  !onPublicProfile && "text-gray-500",
                )}
              >
                Open to collaboration
              </p>
            </div>
          )}
          {profile.openToGigs && (
            <div
              className={clsx(
                onPublicProfile &&
                  "p-4 bg-amber-500/20 border-2 border-b-4 rounded",
              )}
            >
              <p
                className={clsx(
                  "text-xs font-bold uppercase",
                  !onPublicProfile && "text-gray-500",
                )}
              >
                Open to gigs
              </p>
            </div>
          )}
          {profile.needActForShow && (
            <div
              className={clsx(
                onPublicProfile &&
                  "p-4 bg-emerald-500/20 border-2 border-b-4 rounded",
              )}
            >
              <p
                className={clsx(
                  "text-xs font-bold uppercase",
                  !onPublicProfile && "text-gray-500",
                )}
              >
                Booking shows
              </p>
            </div>
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
                    <p>{profile.statusMessage}</p>
                  </div>
                </SettingsModal>
              )}
            </div>
          )}
        </div>
      </div>
      {profile.statusMessage && onPublicProfile && (
        <div className="flex flex-col gap-2">
          <h2 className="font-bold uppercase">Status Message</h2>
          <div className="border p-4 rounded">
            <p>{profile.statusMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
