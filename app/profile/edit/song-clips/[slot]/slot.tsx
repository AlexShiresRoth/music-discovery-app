"use client";

import PreHeader from "@/app/profile/pre-header";
import { songClipFormFields } from "@/app/profile/schemas";
import SelectInput from "@/components/select-input";
import TextInput from "@/components/text-input";
import WaveSurferUI from "@/components/wave-surfer";
import { GENRE_GROUPS } from "@/constants";
import { ToastContext } from "@/context/toast";
import { Loader2, Upload } from "lucide-react";
import { useContext, useState } from "react";
import { emptySlot, titleFromFilename } from "./helpers";
import { ClipSelection, ClipSlotDraft } from "./types";

export default function SongClipSlot({
  draft,
  index,
  isFormPending,
  setDraft,
}: {
  index: number;
  isFormPending: boolean;
  setDraft: (draft: ClipSlotDraft) => void;
  draft: ClipSlotDraft;
}) {
  const { setToast } = useContext(ToastContext);
  const [audioFile, setAudioFile] = useState<File | null>(draft.file);
  const [selection, setSelection] = useState<ClipSelection | null>(
    draft.selectedRegion ?? null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const clearSlotDraft = async () => {
    setDraft(emptySlot());
    setAudioFile(null);
    setSelection(null);
  };

  const handleDeleteFile = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch("/api/profile/delete-song-clip", {
        method: "DELETE",
        body: JSON.stringify({ clipId: draft.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete song clip");
      }

      clearSlotDraft();

      setToast({
        message: `Song clip deleted successfully`,
        type: "success",
      });
    } catch {
      setIsDeleting(false);
      setToast({
        message: `Could not delete song clip`,
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDraftUpdate = (next: ClipSlotDraft) => {
    setDraft(next);
  };

  const handleFileSelected = (file: File | null) => {
    if (!file) return;

    try {
      setAudioFile(file);
      handleDraftUpdate({
        ...draft,
        file,
        fileName: file.name,
        title: draft.title || titleFromFilename(file.name),
        dbUrl: null,
        genre: draft.genre || "",
      });
    } catch {
      setToast({
        message: `Could not set audio file for ${file.name}`,
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PreHeader>Clip {index + 1}</PreHeader>

      <div id={`waveform-${index}`} className="flex flex-col gap-2">
        <PreHeader>Audio File</PreHeader>
        <label className="flex items-center gap-2 cursor-pointer hover:text-amber-500 hover:transition-colors">
          <Upload size={16} />
          <span>
            {audioFile?.name || draft.fileName || "Choose an audio file"}
          </span>
          <input
            type="file"
            accept="audio/*"
            disabled={isFormPending || isDeleting}
            className="sr-only"
            onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
          />
        </label>
        {audioFile && (
          <button
            type="button"
            disabled={isFormPending || isDeleting}
            onClick={clearSlotDraft}
            className="self-start text-sm text-gray-400/80 hover:text-red-500 transition-colors hover:cursor-pointer"
          >
            Clear file
          </button>
        )}
        {draft.dbUrl && (
          <button
            type="button"
            disabled={isDeleting || isFormPending}
            onClick={handleDeleteFile}
            className="self-start text-sm text-gray-400/80 hover:text-red-500 transition-colors hover:cursor-pointer"
          >
            {isDeleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Delete file"
            )}
          </button>
        )}
        {audioFile && (
          <WaveSurferUI
            file={audioFile}
            onSelectionChange={(nextSelection) => {
              setSelection(nextSelection);
              handleDraftUpdate({ ...draft, selectedRegion: nextSelection });
            }}
            selectedRegion={selection}
          />
        )}
        {!audioFile && draft.dbUrl && (
          <WaveSurferUI url={draft.dbUrl} clipName={draft.title || ""} />
        )}
      </div>

      <div className="flex flex-col gap-2 border-b pb-2">
        <PreHeader>{songClipFormFields.title.label}</PreHeader>
        <TextInput
          name={`title-${index}`}
          value={draft.title}
          onChange={(e) =>
            handleDraftUpdate({ ...draft, title: e.target.value })
          }
          isPending={isFormPending || isDeleting}
          placeholder={songClipFormFields.title.placeholder}
          isEdit
        />
      </div>
      <div className="flex flex-col gap-2 border-b pb-2">
        <PreHeader>{songClipFormFields.genre.label}</PreHeader>
        <SelectInput
          groups={GENRE_GROUPS}
          name={`genre-${index}`}
          value={draft.genre}
          onChange={(e) =>
            handleDraftUpdate({ ...draft, genre: e.target.value })
          }
          isPending={isFormPending || isDeleting}
          isEdit
        />
      </div>

      <div className="flex flex-col gap-2 border-b pb-2">
        <PreHeader>{songClipFormFields.full_song_url.label}</PreHeader>
        <TextInput
          name={`fullSongUrl-${index}`}
          value={draft.fullSongUrl}
          onChange={(e) =>
            handleDraftUpdate({ ...draft, fullSongUrl: e.target.value })
          }
          isPending={isFormPending || isDeleting}
          placeholder={songClipFormFields.full_song_url.placeholder}
          isEdit
        />
      </div>
    </div>
  );
}
