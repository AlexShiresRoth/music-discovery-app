"use client";

import ActionButton from "@/components/action-button";
import BackButton from "@/components/breadcrumbs";
import { ToastContext } from "@/context/toast";
import { processAudioForUpload } from "@/lib/audio/trim-clip";
import type { SongClip } from "@/lib/db/types";
import { validateUrl } from "@/lib/validation/url";
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

  const handleNewUpload = async (draft: ClipSlotDraft) => {
    if (!draft.selectedRegion || !draft.file) {
      return {
        error: new Error("Select a file and clip region before uploading"),
        data: null,
      };
    }

    const trimmedWAVFile = await processAudioForUpload(
      draft.file,
      draft.selectedRegion.start,
      draft.selectedRegion.end,
    );

    const draftWithClip: ClipSlotDraft = {
      ...draft,
      file: trimmedWAVFile,
    };

    const mb = trimmedWAVFile.size / 1024 ** 2;

    // vercel limit is 4.5MB
    if (mb > 4.5) {
      return { error: new Error("File is too large"), data: null };
    }

    return { error: null, data: buildClipUploadFormData(draftWithClip, slot) };
  };

  // TODO - we may want to convert to MP3 instead of WAV
  // can use breazystack/lamejs package possibly
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsFormPending(true);

      const urlValidation = validateUrl(draft.fullSongUrl, "Full Song URL");
      if (!urlValidation.ok) {
        throw new Error(urlValidation.error);
      }

      const { error: uploadError, data: formData } =
        await handleNewUpload(draft);

      if (uploadError) {
        throw uploadError;
      }

      const response = await fetch("/api/profile/upload-song-clip", {
        method: "POST",
        body: formData,
      });

      const { error, success } = await response.json();

      if (response.status === 413) {
        throw new Error("File is too large");
      }

      if (!response.ok) {
        throw new Error(error || "Failed to upload song clips");
      }

      if (success) {
        setToast({
          message: "Song clip uploaded successfully",
          type: "success",
        });
        router.refresh();
        router.push("/profile");
      }
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to upload song clips",
        type: "error",
      });
    } finally {
      setIsFormPending(false);
    }
  };

  const handleEditSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsFormPending(true);

      const urlValidation = validateUrl(draft.fullSongUrl, "Full Song URL");
      if (!urlValidation.ok) {
        throw new Error(urlValidation.error);
      }

      const response = await fetch("/api/profile/edit-song-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          full_song_url: draft.fullSongUrl,
          genre: draft.genre,
          id: draft.id,
        }),
      });

      const { error, success } = await response.json();

      if (!response.ok) {
        throw new Error(error || "Failed to edit song clip");
      }

      if (success) {
        setToast({
          message: "Song clip edited successfully",
          type: "success",
        });
        router.refresh();
        router.push("/profile");
      }
    } catch (error) {
      setToast({
        message:
          error instanceof Error ? error.message : "Failed to edit song clip",
        type: "error",
      });
    } finally {
      setIsFormPending(false);
    }
  };

  return (
    <form
      onSubmit={draft.dbUrl ? handleEditSubmit : handleSubmit}
      className="flex flex-col w-full md:p-8 gap-2"
    >
      <div className="flex md:flex-row flex-col-reverse md:items-end justify-between w-full">
        <h2 className="font-bold uppercase">Upload Song Clip</h2>

        <BackButton />
      </div>

      <div className="relative flex flex-col gap-4 border rounded p-8">
        <p className="text-sm text-gray-400/80">
          Each clip must be {MAX_SONG_CLIP_DURATION_SECONDS} seconds or shorter.
        </p>
        <div className="flex flex-col gap-6 pb-4">
          <SongClipSlot
            draft={draft}
            isFormPending={isFormPending}
            setDraft={setDraft}
            index={slot}
          />
        </div>
        <ActionButton type="submit" disabled={isFormPending}>
          {isFormPending ? "Saving..." : `Save`}
        </ActionButton>
      </div>
    </form>
  );
}
