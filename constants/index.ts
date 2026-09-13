export type GenreOption = {
  value: string;
  label: string;
};

export type GenreGroup = {
  label: string;
  options: GenreOption[];
};

const genre = (name: string): GenreOption => ({ value: name, label: name });

/** Source of truth — grouped for UI, flat `GENRES` derived below. */
export const GENRE_GROUPS: GenreGroup[] = [
  {
    label: "Rock & Alternative",
    options: [
      genre("Alternative"),
      genre("Emo"),
      genre("Grunge"),
      genre("Indie"),
      genre("Metal"),
      genre("Post-Rock"),
      genre("Punk"),
      genre("Rock"),
      genre("Surf Rock"),
    ],
  },
  {
    label: "Pop & R&B",
    options: [genre("Funk"), genre("Pop"), genre("R&B"), genre("Soul")],
  },
  {
    label: "Hip-Hop",
    options: [genre("Hip-Hop"), genre("Rap")],
  },
  {
    label: "Electronic & Dance",
    options: [
      genre("Ambient"),
      genre("Dubstep"),
      genre("Electronic"),
      genre("House"),
      genre("Industrial"),
      genre("Techno"),
      genre("Trance"),
    ],
  },
  {
    label: "Jazz, Blues & Folk",
    options: [genre("Blues"), genre("Country"), genre("Folk"), genre("Jazz")],
  },
  {
    label: "World & Roots",
    options: [genre("Dub"), genre("Latin"), genre("Reggae")],
  },
  {
    label: "Other",
    options: [genre("Experimental")],
  },
];

/** Flat list for selects / filters that don't need group headers. */
export const GENRES: GenreOption[] = GENRE_GROUPS.flatMap(
  (group) => group.options,
);

/**
 * Profile discovery status filters.
 * `value` is the URL/search param slug; key is the profiles schema field.
 */
export const PROFILE_STATUS_FILTERS = {
  openToCollaboration: {
    value: "open-to-collaboration",
    label: "Open to Collaboration",
  },
  openToGigs: {
    value: "open-to-gigs",
    label: "Open to Gigs",
  },
  needActForShow: {
    value: "booking-shows",
    label: "Booking Shows",
  },
} as const;

export type ProfileStatusField = keyof typeof PROFILE_STATUS_FILTERS;
export type ProfileStatusValue =
  (typeof PROFILE_STATUS_FILTERS)[ProfileStatusField]["value"];

export const STATUS_OPTIONS: Array<{
  value: ProfileStatusValue;
  label: string;
}> = (
  Object.values(PROFILE_STATUS_FILTERS) as Array<{
    value: ProfileStatusValue;
    label: string;
  }>
);

export const STATUS_VALUES: ProfileStatusValue[] = STATUS_OPTIONS.map(
  (option) => option.value,
);
