import { Profile } from "@/lib/db/types";

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
