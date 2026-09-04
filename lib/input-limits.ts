/**
 * Client + server input length limits.
 * Review these values — they are applied via `maxLength` on form controls
 * (and mirrored in feedback server validation).
 */
export const INPUT_MAX = {
  /** Auth / contact emails (practical RFC upper bound). */
  email: 320,
  /** Passwords — high enough for passphrases, bounded for abuse. */
  password: 128,
  /** Artist display name on profile. */
  displayName: 50,
  /** Private contact / full name. */
  contactName: 100,
  /** Public bio. */
  bio: 500,
  /** Single influence tag. */
  influence: 50,
  /** Profile social links, song URLs, etc. */
  url: 2048,
  /** Song clip title. */
  songTitle: 100,
  /** Header search. */
  search: 100,
  /** Location geocoder / city search query. */
  locationQuery: 200,
  /** City, country, state, formatted address fields. */
  locationField: 200,
  /** ISO-ish country code. */
  countryCode: 2,
  /** State / region code. */
  stateCode: 10,
  /** Feature requests & bug reports (matches server parse). */
  feedbackMessage: 5_000,
  /** Account report free-text description. */
  reportDescription: 2_000,
} as const;

export type InputMaxKey = keyof typeof INPUT_MAX;
