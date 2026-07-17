"use client";

import { ToastContext } from "@/context/toast";
import type { SongClip } from "@/lib/db/types";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { MAX_SONG_CLIP_DURATION_SECONDS } from "../../../schemas";
import { buildClipUploadFormData, emptySlot, songClipToDraft } from "./helpers";
import SongClipSlot from "./slot";
import { ClipSlotDraft } from "./types";

type Props = {
  clip?: SongClip;
  isVerified: boolean;
  slot: number;
};

export default function EditClips({ clip, slot }: Props) {
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [isFormPending, setIsFormPending] = useState(false);

  const [draft, setDraft] = useState<ClipSlotDraft>(() =>
    clip ? songClipToDraft(clip) : emptySlot(),
  );

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsFormPending(true);
      const formData = buildClipUploadFormData(draft, slot);

      const response = await fetch("/api/profile/upload-song-clip", {
        method: "POST",
        body: formData,
      });

      const { error, success } = await response.json();

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
          message: `Song clip uploaded successfully`,
          type: "success",
        });
        router.refresh();
        router.push("/profile");
      }

      setIsFormPending(false);
    } catch (error) {
      setIsFormPending(false);
      setToast({ message: JSON.stringify(error), type: "error" });
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full md:p-8 gap-4">
      <div className="flex md:flex-row flex-col-reverse md:items-center justify-between w-full">
        <h2 className="font-bold uppercase">Upload Song Clip</h2>
        <div>
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="text-sm text-gray-400/80 hover:cursor-pointer hover:text-gray-500 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      <div className="relative flex flex-col gap-4">
        <p className="text-sm text-gray-400/80">
          Each clip must be {MAX_SONG_CLIP_DURATION_SECONDS} seconds or shorter.
        </p>
        <div className="flex flex-col gap-6 pb-10">
          <SongClipSlot
            draft={draft}
            isFormPending={isFormPending}
            setDraft={setDraft}
            index={slot}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isFormPending}
        className="self-end px-4 py-2 rounded bg-amber-500 uppercase font-bold hover:cursor-pointer hover:bg-amber-600 transition-colors disabled:bg-amber-500/30"
      >
        {isFormPending ? "Uploading" : `Save`}
      </button>
    </form>
  );
}
