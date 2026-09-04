import { Profile, SongClip } from "@/lib/db/types";
import { INPUT_MAX } from "@/lib/input-limits";

export const MAX_SONG_CLIPS = 3;
export const MAX_SONG_CLIP_DURATION_SECONDS = 30;

export type FormField = {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
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
    maxLength: INPUT_MAX.locationField,
  },
  city: {
    name: "city",
    label: "City",
    placeholder: "City",
    required: true,
    maxLength: INPUT_MAX.locationField,
  },
  country: {
    name: "country",
    label: "Country",
    placeholder: "Country",
    required: true,
    maxLength: INPUT_MAX.locationField,
  },
  countryCode: {
    name: "countryCode",
    label: "Country Code",
    placeholder: "Country Code",
    required: true,
    maxLength: INPUT_MAX.countryCode,
  },
  state: {
    name: "state",
    label: "State",
    placeholder: "State",
    required: true,
    maxLength: INPUT_MAX.locationField,
  },
  stateCode: {
    name: "stateCode",
    label: "State Code",
    placeholder: "State Code",
    required: true,
    maxLength: INPUT_MAX.stateCode,
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
    maxLength: INPUT_MAX.songTitle,
  },
  full_song_url: {
    name: "fullSongUrl",
    label: "Full Song URL",
    placeholder: "Link to the full track",
    required: false,
    maxLength: INPUT_MAX.url,
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
    maxLength: INPUT_MAX.contactName,
  },
  contactEmail: {
    name: "contactEmail",
    label: "Contact Email",
    placeholder: "Contact Email",
    required: true,
    maxLength: INPUT_MAX.email,
  },
  influences: {
    name: "influences",
    label: "Influences",
    placeholder: "Influences",
    required: false,
    maxLength: INPUT_MAX.influence,
  },
  // UI-only label for the geocoder section; PostGIS value is derived server-side
  location: {
    name: "location",
    label: "Location",
    placeholder: "Enter your location (min 3 characters)",
    required: true,
    maxLength: INPUT_MAX.locationQuery,
  },
  website: {
    name: "website",
    label: "Website",
    placeholder: "Website URL",
    required: false,
    maxLength: INPUT_MAX.url,
  },
  facebook: {
    name: "facebook",
    label: "Facebook",
    placeholder: "Facebook URL",
    required: false,
    maxLength: INPUT_MAX.url,
  },
  instagram: {
    name: "instagram",
    label: "Instagram",
    placeholder: "Instagram URL",
    required: false,
    maxLength: INPUT_MAX.url,
  },
  tiktok: {
    name: "tiktok",
    label: "TikTok",
    placeholder: "TikTok URL",
    required: false,
    maxLength: INPUT_MAX.url,
  },
  spotify: {
    name: "spotify",
    label: "Spotify",
    placeholder: "Spotify URL",
    required: false,
    maxLength: INPUT_MAX.url,
  },
  appleMusic: {
    name: "appleMusic",
    label: "Apple Music",
    placeholder: "Apple Music URL",
    required: false,
    maxLength: INPUT_MAX.url,
  },
  soundcloud: {
    name: "soundcloud",
    label: "SoundCloud",
    placeholder: "SoundCloud URL",
    required: false,
    maxLength: INPUT_MAX.url,
  },
  bandcamp: {
    name: "bandcamp",
    label: "Bandcamp",
    placeholder: "Bandcamp URL",
    required: false,
    maxLength: INPUT_MAX.url,
  },
  profileName: {
    name: "profileName",
    label: "Display Name",
    placeholder: "Display Name",
    required: true,
    maxLength: INPUT_MAX.displayName,
  },
  bio: {
    name: "bio",
    label: "Bio",
    placeholder: "Bio",
    required: false,
    maxLength: INPUT_MAX.bio,
  },
  imageUrl: {
    name: "imageUrl",
    label: "Image URL",
    placeholder: "Image URL",
    required: false,
    maxLength: INPUT_MAX.url,
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
