"use client";

import ActionButton from "@/components/action-button";
import { SettingsModal } from "@/components/settings-layout";
import { ToastContext } from "@/context/toast";
import { SongClip } from "@/lib/db/types";
import { ChevronDown, ChevronUp, ListOrdered } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

type Props = {
  clips: SongClip[];
};

function sortBySlot(clips: SongClip[]) {
  return [...clips].sort((a, b) => a.slot - b.slot);
}

// TODO eventually make into a DND component
export default function ReorderClipsModal({ clips }: Props) {
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [isVisible, setIsVisible] = useState(false);
  const [currentOrderOfClips, setCurrentOrderOfClips] = useState(() =>
    sortBySlot(clips),
  );
  const [isSaving, setIsSaving] = useState(false);

  const openModal = () => {
    setCurrentOrderOfClips(sortBySlot(clips));
    setIsVisible(true);
  };

  const closeModal = () => {
    setIsVisible(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile/reorder-clips", {
        method: "POST",
        body: JSON.stringify({
          clips: currentOrderOfClips,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to reorder clips");
      }
      setToast({ message: "Clips reordered successfully", type: "success" });
      router.refresh();
      closeModal();
    } catch {
      setToast({ message: "Failed to reorder clips", type: "error" });
    }
    setIsSaving(false);
  };

  const handleMove = (clip: SongClip, direction: "up" | "down") => {
    setCurrentOrderOfClips((prev) => {
      const newOrder = [...prev];
      const clipIndex = newOrder.findIndex((c) => c.id === clip.id);
      if (clipIndex === -1) return prev;
      if (direction === "up") {
        if (clipIndex === 0) return prev;
        const temp = newOrder[clipIndex - 1];
        newOrder[clipIndex - 1] = clip;
        newOrder[clipIndex] = temp;
      }
      if (direction === "down") {
        if (clipIndex === newOrder.length - 1) return prev;
        const temp = newOrder[clipIndex + 1];
        newOrder[clipIndex + 1] = clip;
        newOrder[clipIndex] = temp;
      }
      return newOrder;
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="hover:cursor-pointer flex items-center gap-1"
      >
        <ListOrdered className="w-4 h-4" /> {` `} Reorder Clips
      </button>
      {isVisible && (
        <SettingsModal
          title="Reorder Clips"
          actions={
            <>
              <ActionButton onClick={closeModal}>Cancel</ActionButton>
              <ActionButton onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </ActionButton>
            </>
          }
          onClose={closeModal}
        >
          <div className="flex flex-col gap-4">
            {currentOrderOfClips.map((clip, index) => (
              <div
                key={clip.id}
                className="flex items-center justify-between border-2 rounded p-2 bg-background gap-2"
              >
                <div className="flex items-center gap-8">
                  <div className="flex items-center">
                    {index > 0 && (
                      <ActionButton
                        disabled={index === 0}
                        onClick={() => handleMove(clip, "up")}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </ActionButton>
                    )}

                    {index < currentOrderOfClips.length - 1 && (
                      <ActionButton onClick={() => handleMove(clip, "down")}>
                        <ChevronDown className="w-4 h-4" />
                      </ActionButton>
                    )}
                  </div>
                  <p className="min-w-0 truncate ">
                    {clip.title && clip.title?.length > 15 ? (
                      <>{clip.title?.slice(0, 15)}...</>
                    ) : (
                      clip.title
                    )}
                  </p>
                </div>
                <p className="tabular-nums shrink-0">{index + 1}</p>
              </div>
            ))}
          </div>
        </SettingsModal>
      )}
    </>
  );
}
