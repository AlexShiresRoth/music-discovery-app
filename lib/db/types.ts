import { profilesSchema, songClipsSchema } from "./schema";

export type SongClipWithSlot = {
  slot: number;
  id: string;
};

export type SongClip = typeof songClipsSchema.$inferSelect;

export type Profile = typeof profilesSchema.$inferSelect;
