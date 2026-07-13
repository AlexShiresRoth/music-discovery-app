"use client";

import { ToastContext } from "@/context/toast";
import type { SongClip } from "@/lib/db/types";
import clsx from "clsx";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { MAX_SONG_CLIP_DURATION_SECONDS, MAX_SONG_CLIPS } from "../../schemas";
import { emptySlot } from "./helpers";
import SongClipSlot from "./slot";
import { ClipSlotDraft } from "./types";

type Props = {
  clips: SongClip[];
  isVerified: boolean;
};

export default function EditClips({ clips }: Props) {
  const router = useRouter();
  const filledSlots = clips.length;
  const { setToast } = useContext(ToastContext);
  const [isFormPending, setIsFormPending] = useState(false);

  const [drafts, setDrafts] = useState<ClipSlotDraft[]>(
    Array.from({ length: MAX_SONG_CLIPS }, () => emptySlot()),
  );

  const [openSlots, setOpenSlots] = useState<number>(clips.length || 1);

  const setDraft = (draft: ClipSlotDraft, index: number) => {
    setDrafts((prev) => {
      const newDrafts = [...prev];
      newDrafts[index] = draft;
      return newDrafts;
    });
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsFormPending(true);
      const formData = new FormData();
      drafts.forEach((draft, index) => {
        if (draft.file) {
          formData.append(`files`, draft.file as File);
          formData.append(
            `metadata`,
            JSON.stringify({
              index,
              title: draft.title,
              fullSongUrl: draft.fullSongUrl,
            }),
          );
        }
      });

      const response = await fetch("/api/profile/upload-song-clip", {
        method: "POST",
        body: formData,
      });

      const { error, success, count } = await response.json();

      if (!response.ok) {
        setToast({
          message: error || "Failed to upload song clips",
          type: "error",
        });
        setIsFormPending(false);
        return;
      }

      if (success) {
        setToast({
          message: `${count} song clip${count === 1 ? "" : "s"} uploaded successfully`,
          type: "success",
        });
        router.refresh();
        router.back();
      }

      setIsFormPending(false);
    } catch (error) {
      setIsFormPending(false);
      setToast({ message: JSON.stringify(error), type: "error" });
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full p-8 gap-4">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col gap-1">
          <h2 className="font-bold uppercase text-indigo-500">
            Upload Song Clip
          </h2>
        </div>
      </div>

      <div className="relative">
        <p className="text-sm text-gray-400/80">
          Each clip must be {MAX_SONG_CLIP_DURATION_SECONDS} seconds or shorter.
        </p>
        <div className="flex flex-col gap-6 pb-10">
          {drafts.slice(0, openSlots).map((clip, index) => {
            return (
              <SongClipSlot
                key={index}
                clip={clip}
                index={index}
                isFormPending={isFormPending}
                setDrafts={setDraft}
              />
            );
          })}
          <div className="flex items-center w-full justify-between">
            <button
              type="button"
              disabled={openSlots >= MAX_SONG_CLIPS}
              onClick={() => {
                if (openSlots < MAX_SONG_CLIPS) {
                  setOpenSlots(openSlots + 1);
                  setDrafts([...drafts, emptySlot()]);
                }
              }}
              className={clsx(
                "flex items-center gap-2 text-sm text-gray-400/80 hover:text-indigo-500 transition-colors hover:cursor-pointer",
                "disabled:text-gray-400/80",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              <Plus size={16} /> Add another clip
            </button>

            {openSlots > 1 && (
              <button
                type="button"
                onClick={() => {
                  setOpenSlots(openSlots - 1);
                  setDrafts(drafts.slice(0, -1));
                }}
                className="flex items-center gap-2 text-sm text-gray-400/80 hover:text-indigo-500 transition-colors hover:cursor-pointer"
              >
                <Minus size={16} /> Remove last clip
              </button>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isFormPending}
        className="self-end px-4 py-2 rounded bg-indigo-500 uppercase text-black font-bold hover:cursor-pointer hover:bg-indigo-600 transition-colors disabled:bg-indigo-500/30"
      >
        {isFormPending ? "Uploading" : `Save`}
      </button>
    </form>
  );
}
