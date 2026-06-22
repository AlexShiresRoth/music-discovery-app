import { ArtistProfile } from "@/lib/db/types";

export type ArtistProfileFormSchemaWithoutId = Omit<
  ArtistProfile,
  "id" | "joinedDate" | "songClips" | "membersWithAccess" | "userRefId"
>;

const ArtistProfileFormSchema: Record<
  keyof ArtistProfileFormSchemaWithoutId,
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
    placeholder: "Website",
    required: false,
  },
  facebook: {
    name: "facebook",
    label: "Facebook",
    placeholder: "Facebook",
    required: false,
  },
  instagram: {
    name: "instagram",
    label: "Instagram",
    placeholder: "Instagram",
    required: false,
  },
  tiktok: {
    name: "tiktok",
    label: "TikTok",
    placeholder: "TikTok",
    required: false,
  },
  spotify: {
    name: "spotify",
    label: "Spotify",
    placeholder: "Spotify",
    required: false,
  },
  appleMusic: {
    name: "appleMusic",
    label: "Apple Music",
    placeholder: "Apple Music",
    required: false,
  },
  soundcloud: {
    name: "soundcloud",
    label: "SoundCloud",
    placeholder: "SoundCloud",
    required: false,
  },
  artistName: {
    name: "artistName",
    label: "Artist Name",
    placeholder: "Artist Name",
    required: true,
  },
  artistDescription: {
    name: "artistDescription",
    label: "Bio",
    placeholder: "Bio",
    required: false,
  },
  artistLogo: {
    name: "artistLogo",
    label: "Artist Logo",
    placeholder: "Artist Logo",
    required: false,
  },
  genre: {
    name: "genre",
    label: "Genre",
    placeholder: "Genre",
    required: true,
  },
  members: {
    name: "members",
    label: "Members",
    placeholder: "Members",
    required: true,
  },
  imageUrl: {
    name: "imageUrl",
    label: "Image URL",
    placeholder: "Image URL",
    required: false,
  },
};

export const artistFormFields = ArtistProfileFormSchema;
