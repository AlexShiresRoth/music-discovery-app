import { ClipSlotDraft } from "./types";

/**
 *
 * @returns default empty slot ubject
 */
export function emptySlot(): ClipSlotDraft {
  return { file: null, fileName: "", title: "", fullSongUrl: "", slot: null };
}

/**
 *
 * @param filename
 * @returns title from filename (without extension)
 */
export function titleFromFilename(filename: string) {
  return filename.replace(/\.[^.]+$/, "");
}
