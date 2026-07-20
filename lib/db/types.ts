import { profilesSchema, songClipsSchema } from "./schema";

export type SongClipWithSlot = {
  slot: number;
  id: string;
};

export type SocialField = {
  url: string;
  show: boolean;
};
export type SongClip = typeof songClipsSchema.$inferSelect;

export type Profile = typeof profilesSchema.$inferSelect;

export type ProfileWithSongClips = Omit<Profile, "songClips"> & {
  songClips: SongClip[];
};
