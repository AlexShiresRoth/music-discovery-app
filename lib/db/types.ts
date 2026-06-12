import {
  artistProfilesSchema,
  listenerProfilesSchema,
  songClipsSchema,
} from "./schema";

export type SongClip = typeof songClipsSchema.$inferSelect;

export type ArtistProfile = typeof artistProfilesSchema.$inferSelect;

export type ListenerProfile = typeof listenerProfilesSchema.$inferSelect;
