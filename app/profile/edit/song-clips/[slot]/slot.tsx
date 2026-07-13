"use client";

import PreHeader from "@/app/profile/pre-header";
import { songClipFormFields } from "@/app/profile/schemas";
import TextInput from "@/components/text-input";
import WaveSurferUI from "@/components/wave-surfer";
import { ToastContext } from "@/context/toast";
import { Upload } from "lucide-react";
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

  const clearSlotDraft = () => {
    const cleared = emptySlot();
    setDraft(cleared);
    setAudioFile(null);
    setSelection(null);
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
      });
    } catch {
      setToast({
        message: `Could not set audio file for ${file.name}`,
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-8 border border-gray-400/40 rounded-md">
      <PreHeader>Clip {index + 1}</PreHeader>

      <div id={`waveform-${index}`} className="flex flex-col gap-2">
        <PreHeader>Audio File</PreHeader>
        <label className="flex items-center gap-2 cursor-pointer text-gray-400/80 hover:text-indigo-500 transition-colors">
          <Upload size={16} />
          <span>
            {audioFile?.name || draft.fileName || "Choose an audio file"}
          </span>
          <input
            type="file"
            accept="audio/*"
            disabled={isFormPending}
            className="sr-only"
            onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
          />
        </label>
        {(audioFile || draft.dbUrl) && (
          <button
            type="button"
            disabled={isFormPending}
            onClick={clearSlotDraft}
            className="self-start text-sm text-gray-400/80 hover:text-red-500 transition-colors hover:cursor-pointer"
          >
            Clear file
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

      <div className="flex flex-col gap-2">
        <PreHeader>{songClipFormFields.title.label}</PreHeader>
        <TextInput
          name={`title-${index}`}
          value={draft.title}
          onChange={(e) =>
            handleDraftUpdate({ ...draft, title: e.target.value })
          }
          isPending={isFormPending}
          placeholder={songClipFormFields.title.placeholder}
          isEdit
        />
      </div>

      <div className="flex flex-col gap-2">
        <PreHeader>{songClipFormFields.full_song_url.label}</PreHeader>
        <TextInput
          name={`fullSongUrl-${index}`}
          value={draft.fullSongUrl}
          onChange={(e) =>
            handleDraftUpdate({ ...draft, fullSongUrl: e.target.value })
          }
          isPending={isFormPending}
          placeholder={songClipFormFields.full_song_url.placeholder}
          isEdit
        />
      </div>
    </div>
  );
}
