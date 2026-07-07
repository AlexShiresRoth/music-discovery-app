import { profilesSchema, songClipsSchema } from "./schema";

export type SongClip = typeof songClipsSchema.$inferSelect;

export type Profile = typeof profilesSchema.$inferSelect;
