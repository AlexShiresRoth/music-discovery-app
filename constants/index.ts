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
    options: [
      genre("Funk"),
      genre("Pop"),
      genre("R&B"),
      genre("Soul"),
    ],
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
    options: [
      genre("Blues"),
      genre("Country"),
      genre("Folk"),
      genre("Jazz"),
    ],
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
