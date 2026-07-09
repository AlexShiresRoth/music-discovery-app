"use client";

import TextInput from "@/components/text-input";
import { ToastContext } from "@/context/toast";
import type { SongClip } from "@/lib/db/types";
import { Music, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import PreHeader from "../../pre-header";
import {
  MAX_SONG_CLIP_DURATION_SECONDS,
  MAX_SONG_CLIPS,
  songClipFormFields,
} from "../../schemas";

type ClipSlotDraft = {
  file: File | null;
  fileName: string;
  title: string;
  fullSongUrl: string;
  slot: number | null;
};

type Props = {
  clips: SongClip[];
  isVerified: boolean;
};

function emptySlot(): ClipSlotDraft {
  return { file: null, fileName: "", title: "", fullSongUrl: "", slot: null };
}

function titleFromFilename(filename: string) {
  return filename.replace(/\.[^.]+$/, "");
}

function ExistingClipContent({ clip }: { clip: SongClip }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Music size={14} className="text-indigo-500" />
        <span>{clip.title}</span>
      </div>
      {clip.db_url && <audio controls src={clip.db_url} className="w-full" />}
      {clip.full_song_url && (
        <a
          href={clip.full_song_url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-indigo-500 hover:underline"
        >
          {clip.full_song_url}
        </a>
      )}
    </>
  );
}

function ClipSlotView({
  clip,
  slotNumber,
}: {
  clip?: SongClip;
  slotNumber: number;
}) {
  return (
    <div className="flex flex-col gap-3 border border-gray-400/80 rounded-md p-4 w-full">
      <PreHeader>Clip {slotNumber}</PreHeader>
      {clip ? (
        <ExistingClipContent clip={clip} />
      ) : (
        <p className="text-sm text-gray-400/80">No clip uploaded</p>
      )}
    </div>
  );
}

// TODO - have all slots on one page
export default function EditClips({ clips }: Props) {
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [isFormPending, setIsFormPending] = useState(false);

  const [drafts, setDrafts] = useState<ClipSlotDraft[]>(
    Array.from({ length: MAX_SONG_CLIPS }, () => emptySlot()),
  );

  const filledSlots = clips.length;
  const draft = emptySlot();

  // TODO - maybe song clips should be it's own page
  // and it should be one at a time
  // the user would upload a song, we 'd render the wavesurfer.js thing and have them select a clip
  // then on save we'd check duration and save the clip
  // const duration = await getAudioDurationFromFile(file);

  // if (!isValidClipDuration(duration)) {
  //   setToast({
  //     message: clipDurationErrorMessage(file.name),
  //     type: "error",
  //   });
  //   return;
  // }
  const handleFileSelected = async (index: number, file: File | null) => {
    if (!file) {
      return;
    }

    try {
    } catch {
      setToast({
        message: `Could not read audio duration for ${file.name}`,
        type: "error",
      });
    }
  };

  const clearSlotDraft = (index: number) => {};

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsFormPending(true);
      const formData = new FormData();

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

  console.log("CLIPS", drafts);
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
          {drafts.map((clip, index) => {
            return (
              <div
                className="flex flex-col gap-4 p-8 border border-gray-400/40 rounded-md"
                key={index}
              >
                <PreHeader>Clip {index + 1}</PreHeader>

                <div className="flex flex-col gap-2">
                  <PreHeader>Audio File</PreHeader>
                  <label className="flex items-center gap-2 cursor-pointer text-gray-400/80 hover:text-indigo-500 transition-colors">
                    <Upload size={16} />
                    <span>{"Choose an audio file"}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      disabled={isFormPending}
                      className="sr-only"
                      defaultValue={clip.fileName}
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
                  <PreHeader>
                    {songClipFormFields.full_song_url.label}
                  </PreHeader>
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
          })}
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
