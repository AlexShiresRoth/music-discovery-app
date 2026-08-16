import { Profile, SongClip } from "@/lib/db/types";

export const MAX_SONG_CLIPS = 3;
export const MAX_SONG_CLIP_DURATION_SECONDS = 30;

export type FormField = {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
};

/** Flat address fields collected by GeoCityInput (not the PostGIS `location` column). */
export type ProfileLocation = Pick<
  Profile,
  | "formattedLocation"
  | "city"
  | "country"
  | "countryCode"
  | "state"
  | "stateCode"
  | "lat"
  | "lon"
>;

export const locationFormFields: Record<keyof ProfileLocation, FormField> = {
  formattedLocation: {
    name: "formattedLocation",
    label: "Formatted Location",
    placeholder: "Formatted Location",
    required: true,
  },
  city: {
    name: "city",
    label: "City",
    placeholder: "City",
    required: true,
  },
  country: {
    name: "country",
    label: "Country",
    placeholder: "Country",
    required: true,
  },
  countryCode: {
    name: "countryCode",
    label: "Country Code",
    placeholder: "Country Code",
    required: true,
  },
  state: {
    name: "state",
    label: "State",
    placeholder: "State",
    required: true,
  },
  stateCode: {
    name: "stateCode",
    label: "State Code",
    placeholder: "State Code",
    required: true,
  },
  lat: {
    name: "lat",
    label: "Latitude",
    placeholder: "Latitude",
    required: true,
  },
  lon: {
    name: "lon",
    label: "Longitude",
    placeholder: "Longitude",
    required: true,
  },
};

export const songClipFormFields: Record<
  keyof Pick<SongClip, "title" | "full_song_url" | "genre">,
  FormField
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
  genre: {
    name: "genre",
    label: "Genre",
    placeholder: "Genre",
    required: false,
  },
};

export type ProfileFormSchemaWithoutId = Omit<
  Profile,
  | "id"
  | "joinedDate"
  | "songClips"
  | "userRefId"
  | "isVerified"
  | "genre"
  | "public"
>;

const ProfileFormSchema: Record<keyof ProfileFormSchemaWithoutId, FormField> = {
  fullName: {
    name: "fullName",
    label: "Contact Name",
    placeholder: "Contact Name",
    required: true,
  },
  contactEmail: {
    name: "contactEmail",
    label: "Contact Email",
    placeholder: "Contact Email",
    required: true,
  },
  influences: {
    name: "influences",
    label: "Influences",
    placeholder: "Influences",
    required: false,
  },
  // UI-only label for the geocoder section; PostGIS value is derived server-side
  location: {
    name: "location",
    label: "Location",
    placeholder: "Enter your location (min 3 characters)",
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
  imageUrl: {
    name: "imageUrl",
    label: "Image URL",
    placeholder: "Image URL",
    required: false,
  },
  updatedAt: {
    name: "updatedAt",
    label: "Updated At",
    placeholder: "Updated At",
    required: false,
  },
  createdAt: {
    name: "createdAt",
    label: "Created At",
    placeholder: "Created At",
    required: false,
  },
  ...locationFormFields,
};

export const profileFormFields = ProfileFormSchema;
