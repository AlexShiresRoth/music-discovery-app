"use client";

import TextInput from "@/components/text-input";
import { ToastContext } from "@/context/toast";
import type { SongClip } from "@/lib/db/types";
import clsx from "clsx";
import { Music, Pencil, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import PreHeader from "./pre-header";
import {
  MAX_SONG_CLIPS,
  MAX_SONG_CLIP_DURATION_SECONDS,
  songClipFormFields,
} from "./schemas";
import {
  clipDurationErrorMessage,
  getAudioDurationFromFile,
  isValidClipDuration,
} from "@/lib/audio/song-clip-duration";

type Mode = "Edit" | "View";

type ClipSlotDraft = {
  file: File | null;
  fileName: string;
  title: string;
  fullSongUrl: string;
};

type Props = {
  clips: SongClip[];
  isVerified: boolean;
  mode?: Mode;
};

function emptySlot(): ClipSlotDraft {
  return { file: null, fileName: "", title: "", fullSongUrl: "" };
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
    <div className="flex flex-col gap-3 border border-gray-400/80 rounded-md p-4">
      <PreHeader>Clip {slotNumber}</PreHeader>
      {clip ? (
        <ExistingClipContent clip={clip} />
      ) : (
        <p className="text-sm text-gray-400/80">No clip uploaded</p>
      )}
    </div>
  );
}

export default function SongClipsSection({
  clips,
  isVerified,
  mode = "View",
}: Props) {
  const isEdit = mode === "Edit";
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [isFormPending, setIsFormPending] = useState(false);
  const [slotDrafts, setSlotDrafts] = useState<ClipSlotDraft[]>(() =>
    Array.from({ length: MAX_SONG_CLIPS }, () => emptySlot()),
  );

  const filledSlots = clips.length;
  const atMaxClips = filledSlots >= MAX_SONG_CLIPS;

  const updateSlot = (
    index: number,
    field: keyof ClipSlotDraft,
    value: string | File | null,
  ) => {
    setSlotDrafts((slots) =>
      slots.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot,
      ),
    );
  };

  const handleFileSelected = async (index: number, file: File | null) => {
    if (!file) {
      setSlotDrafts((slots) =>
        slots.map((slot, i) => (i === index ? emptySlot() : slot)),
      );
      return;
    }

    try {
      const duration = await getAudioDurationFromFile(file);

      if (!isValidClipDuration(duration)) {
        setToast({
          message: clipDurationErrorMessage(file.name),
          type: "error",
        });
        return;
      }

      setSlotDrafts((slots) =>
        slots.map((slot, i) =>
          i === index
            ? {
                ...slot,
                file,
                fileName: file.name,
                title: slot.title || titleFromFilename(file.name),
              }
            : slot,
        ),
      );
    } catch {
      setToast({
        message: `Could not read audio duration for ${file.name}`,
        type: "error",
      });
    }
  };

  const clearSlotDraft = (index: number) => {
    setSlotDrafts((slots) =>
      slots.map((slot, i) => (i === index ? emptySlot() : slot)),
    );
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const pendingUploads = slotDrafts
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot, index }) => !clips[index] && slot.file);

    if (pendingUploads.length === 0) {
      setToast({
        message: "Add at least one clip file to upload",
        type: "error",
      });
      return;
    }

    if (clips.length + pendingUploads.length > MAX_SONG_CLIPS) {
      setToast({
        message: `You can only have up to ${MAX_SONG_CLIPS} song clips`,
        type: "error",
      });
      return;
    }

    for (const { slot, index } of pendingUploads) {
      if (!slot.title.trim()) {
        setToast({
          message: `Clip ${index + 1} needs a title`,
          type: "error",
        });
        return;
      }

      if (!slot.file) continue;

      try {
        const duration = await getAudioDurationFromFile(slot.file);
        if (!isValidClipDuration(duration)) {
          setToast({
            message: clipDurationErrorMessage(slot.file.name),
            type: "error",
          });
          return;
        }
      } catch {
        setToast({
          message: `Could not read audio duration for ${slot.file.name}`,
          type: "error",
        });
        return;
      }
    }

    try {
      setIsFormPending(true);
      const formData = new FormData();

      pendingUploads.forEach(({ slot }) => {
        if (!slot.file) return;
        formData.append("files", slot.file);
        formData.append("titles", slot.title.trim());
        formData.append("fullSongUrls", slot.fullSongUrl.trim());
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

  const pendingCount = slotDrafts.filter(
    (slot, index) => !clips[index] && slot.file,
  ).length;

  const content = (
    <div
      className={clsx(
        "flex flex-col gap-10 w-full border border-gray-400/80 rounded-md p-8",
        isEdit && "max-h-[70vh]",
      )}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col gap-1">
          <h2 className="font-bold uppercase text-indigo-500">Song Clips</h2>
          {isVerified && (
            <p className="text-sm text-gray-400/80">
              {filledSlots} / {MAX_SONG_CLIPS} clips
            </p>
          )}
        </div>
        {!isEdit && isVerified && (
          <Link
            href="/profile/edit/song-clips"
            className="flex items-center gap-1"
          >
            <Pencil size={14} /> {atMaxClips ? "View" : "Edit"}
          </Link>
        )}
        {isEdit && (
          <button
            className="flex p-1 rounded items-center gap-1 hover:cursor-pointer hover:bg-white/10 transition-all"
            onClick={() => router.back()}
            type="button"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {!isVerified && (
        <p className="text-sm text-gray-400/80">
          Verify your account to upload song clips.
        </p>
      )}

      {isEdit ? (
        isVerified ? (
          <div className="relative">
            <p className="text-sm text-gray-400/80">
              Each clip must be {MAX_SONG_CLIP_DURATION_SECONDS} seconds or
              shorter.
            </p>
            <div className="flex flex-col gap-6 max-h-[40vh] overflow-y-auto pb-10">
              {Array.from({ length: MAX_SONG_CLIPS }, (_, index) => {
                const existingClip = clips[index];
                const draft = slotDrafts[index];

                return (
                  <div
                    key={index}
                    className="flex flex-col gap-4 border border-gray-400/80 rounded-md p-4"
                  >
                    <PreHeader>Clip {index + 1}</PreHeader>

                    {existingClip ? (
                      <ExistingClipContent clip={existingClip} />
                    ) : (
                      <>
                        <div className="flex flex-col gap-2">
                          <PreHeader>Audio File</PreHeader>
                          <label className="flex items-center gap-2 cursor-pointer text-gray-400/80 hover:text-indigo-500 transition-colors">
                            <Upload size={16} />
                            <span>
                              {draft.fileName || "Choose an audio file"}
                            </span>
                            <input
                              type="file"
                              accept="audio/*"
                              disabled={isFormPending}
                              className="sr-only"
                              onChange={(e) =>
                                handleFileSelected(
                                  index,
                                  e.target.files?.[0] ?? null,
                                )
                              }
                            />
                          </label>
                          {draft.fileName && (
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
                          <PreHeader>
                            {songClipFormFields.title.label}
                          </PreHeader>
                          <TextInput
                            name={`title-${index}`}
                            value={draft.title}
                            onChange={(e) =>
                              updateSlot(index, "title", e.target.value)
                            }
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
                            value={draft.fullSongUrl}
                            onChange={(e) =>
                              updateSlot(index, "fullSongUrl", e.target.value)
                            }
                            isPending={isFormPending}
                            placeholder={
                              songClipFormFields.full_song_url.placeholder
                            }
                            isEdit
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-5 backdrop-blur-sm" />
          </div>
        ) : (
          <p className="text-sm text-gray-400/80">
            You need to verify your account before uploading song clips.
          </p>
        )
      ) : isVerified ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: MAX_SONG_CLIPS }, (_, index) => (
            <ClipSlotView
              key={index}
              clip={clips[index]}
              slotNumber={index + 1}
            />
          ))}
        </div>
      ) : null}

      {isEdit && isVerified && !atMaxClips && (
        <button
          type="submit"
          disabled={isFormPending || pendingCount === 0}
          className="self-end px-4 py-2 rounded bg-indigo-500 uppercase text-black font-bold hover:cursor-pointer hover:bg-indigo-600 transition-colors disabled:bg-indigo-500/30"
        >
          {isFormPending
            ? "Uploading"
            : `Save${pendingCount > 0 ? ` (${pendingCount})` : ""}`}
        </button>
      )}
    </div>
  );

  return isEdit ? <form onSubmit={handleSubmit}>{content}</form> : content;
}
