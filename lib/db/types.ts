import {
  bugReportsSchema,
  featureRequestsSchema,
  profilesSchema,
  songClipsSchema,
} from "./schema";

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

export type FeatureRequest = typeof featureRequestsSchema.$inferSelect;

export type BugReport = typeof bugReportsSchema.$inferSelect;

export type ProfileWithSongClips = Omit<Profile, "songClips"> & {
  songClips: SongClip[];
};

export type SongClipWithProfile = SongClip & {
  profileName: string;
  profileId: number;
  profileImage: string;
};
