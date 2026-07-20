import { Profile, SongClip } from "@/lib/db/types";

export const MAX_SONG_CLIPS = 3;
export const MAX_SONG_CLIP_DURATION_SECONDS = 30;

export const songClipFormFields: Record<
  keyof Pick<SongClip, "title" | "full_song_url">,
  { name: string; label: string; placeholder?: string; required?: boolean }
> = {
  title: {
    name: "title",
    label: "Title",
    placeholder: "Track title",
    required: true,
  },
  full_song_url: {
    name: "fullSongUrl",
    label: "Full Song URL",
    placeholder: "Link to the full track",
    required: false,
  },
};

export type ProfileFormSchemaWithoutId = Omit<
  Profile,
  "id" | "joinedDate" | "songClips" | "userRefId" | "isVerified"
>;

const ProfileFormSchema: Record<
  keyof ProfileFormSchemaWithoutId,
  { name: string; label: string; placeholder?: string; required?: boolean }
> = {
  fullName: {
    name: "fullName",
    label: "Full Name",
    placeholder: "Full Name",
    required: true,
  },
  contactEmail: {
    name: "contactEmail",
    label: "Contact Email",
    placeholder: "Contact Email",
    required: true,
  },
  city: { name: "city", label: "City", placeholder: "City", required: true },
  state: {
    name: "state",
    label: "State",
    placeholder: "State",
    required: true,
  },
  country: {
    name: "country",
    label: "Country",
    placeholder: "Country",
    required: true,
  },
  website: {
    name: "website",
    label: "Website",
    placeholder: "Website URL",
    required: false,
  },
  facebook: {
    name: "facebook",
    label: "Facebook",
    placeholder: "Facebook URL",
    required: false,
  },
  instagram: {
    name: "instagram",
    label: "Instagram",
    placeholder: "Instagram URL",
    required: false,
  },
  tiktok: {
    name: "tiktok",
    label: "TikTok",
    placeholder: "TikTok URL",
    required: false,
  },
  spotify: {
    name: "spotify",
    label: "Spotify",
    placeholder: "Spotify URL",
    required: false,
  },
  appleMusic: {
    name: "appleMusic",
    label: "Apple Music",
    placeholder: "Apple Music URL",
    required: false,
  },
  soundcloud: {
    name: "soundcloud",
    label: "SoundCloud",
    placeholder: "SoundCloud URL",
    required: false,
  },
  bandcamp: {
    name: "bandcamp",
    label: "Bandcamp",
    placeholder: "Bandcamp URL",
    required: false,
  },
  profileName: {
    name: "profileName",
    label: "Display Name",
    placeholder: "Display Name",
    required: true,
  },
  bio: {
    name: "bio",
    label: "Bio",
    placeholder: "Bio",
    required: false,
  },
  genre: {
    name: "genre",
    label: "Genre",
    placeholder: "Genre",
    required: true,
  },
  imageUrl: {
    name: "imageUrl",
    label: "Image URL",
    placeholder: "Image URL",
    required: false,
  },
};

export const profileFormFields = ProfileFormSchema;
