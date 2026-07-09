"use client";
import TextInput from "@/components/text-input";
import WaveSurferUI from "@/components/wave-surfer";
import { ToastContext } from "@/context/toast";
import { Upload } from "lucide-react";
import { useContext, useState } from "react";
import PreHeader from "../../pre-header";
import { songClipFormFields } from "../../schemas";
import { emptySlot } from "./helpers";
import { ClipSlotDraft } from "./types";

type ClipSelection = {
  start: number;
  end: number;
};

export default function SongClipSlot({
  clip,
  index,
  isFormPending,
}: {
  clip: ClipSlotDraft;
  index: number;
  isFormPending: boolean;
}) {
  const { setToast } = useContext(ToastContext);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [selection, setSelection] = useState<ClipSelection | null>(null);

  const draft = emptySlot();

  const clearSlotDraft = (index: number) => {};

  const handleFileSelected = async (index: number, file: File | null) => {
    if (!file) {
      return;
    }

    console.log("FILE", file);

    setAudioFile(file);

    try {
    } catch {
      setToast({
        message: `Could not set audio file for ${file.name}`,
        type: "error",
      });
    }
  };

  console.log("Selection", selection);

  return (
    <div
      className="flex flex-col gap-4 p-8 border border-gray-400/40 rounded-md"
      key={index}
    >
      <PreHeader>Clip {index + 1}</PreHeader>

      <div id={`waveform-${index}`} className="flex flex-col gap-2">
        <PreHeader>Audio File</PreHeader>
        <label className="flex items-center gap-2 cursor-pointer text-gray-400/80 hover:text-indigo-500 transition-colors">
          <Upload size={16} />
          <span>{"Choose an audio file"}</span>
          <input
            type="file"
            accept="audio/*"
            disabled={isFormPending}
            className="sr-only"
            onChange={(e) =>
              handleFileSelected(index, e.target.files?.[0] ?? null)
            }
          />
        </label>
        {clip.fileName && (
          <button
            type="button"
            disabled={isFormPending}
            onClick={() => clearSlotDraft(index)}
            className="self-start text-sm text-gray-400/80 hover:text-red-500 transition-colors hover:cursor-pointer"
          >
            Clear file
          </button>
        )}
        {audioFile && (
          <WaveSurferUI file={audioFile} onSelectionChange={setSelection} />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <PreHeader>{songClipFormFields.title.label}</PreHeader>
        <TextInput
          name={`title-${index}`}
          value={clip.title}
          onChange={(e) => {}}
          isPending={isFormPending}
          placeholder={songClipFormFields.title.placeholder}
          isEdit
        />
      </div>

      <div className="flex flex-col gap-2">
        <PreHeader>{songClipFormFields.full_song_url.label}</PreHeader>
        <TextInput
          name={`fullSongUrl-${index}`}
          value={clip?.fullSongUrl}
          onChange={() => {}}
          isPending={isFormPending}
          placeholder={songClipFormFields.full_song_url.placeholder}
          isEdit
        />
      </div>
    </div>
  );
}
