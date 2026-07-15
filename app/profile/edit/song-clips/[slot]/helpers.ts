import type { SongClip } from "@/lib/db/types";
import type { ClipSlotDraft, ClipUploadMetadata } from "./types";

export function emptySlot(): ClipSlotDraft {
  return {
    id: undefined,
    file: null,
    fileName: "",
    title: "",
    fullSongUrl: "",
    dbUrl: null,
    selectedRegion: null,
  };
}

export function songClipToDraft(clip: SongClip): ClipSlotDraft {
  return {
    id: clip.id,
    file: null,
    fileName: "",
    title: clip.title ?? "",
    fullSongUrl: clip.full_song_url ?? "",
    dbUrl: clip.db_url,
    selectedRegion: null,
  };
}

export function titleFromFilename(filename: string) {
  return filename.replace(/\.[^.]+$/, "");
}

export function isUploadableDraft(draft: ClipSlotDraft): boolean {
  return Boolean(draft.file);
}

export function toUploadMetadata(
  draft: ClipSlotDraft,
  slot: number,
): ClipUploadMetadata {
  return {
    index: slot,
    title:
      draft.title.trim() ||
      titleFromFilename(draft.fileName || draft.file?.name || ""),
    fullSongUrl: draft.fullSongUrl.trim(),
    selectedRegion: draft.selectedRegion ?? null,
  };
}

export function buildClipUploadFormData(
  draft: ClipSlotDraft,
  slot: number,
): FormData {
  const formData = new FormData();

  if (!isUploadableDraft(draft) || !draft.file) return formData;

  formData.append("file", draft.file);
  formData.append("metadata", JSON.stringify(toUploadMetadata(draft, slot)));

  return formData;
}
