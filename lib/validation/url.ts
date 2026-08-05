export type UrlValidationResult =
  | { ok: true }
  | { ok: false; error: string };

const SOCIAL_PLATFORMS = [
  "website",
  "facebook",
  "instagram",
  "tiktok",
  "spotify",
  "appleMusic",
  "soundcloud",
  "bandcamp",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

/** Extra host fragments when the platform key isn't a substring of the URL (e.g. appleMusic). */
const PLATFORM_HOST_HINTS: Record<SocialPlatform, string[]> = {
  website: [],
  facebook: ["facebook.", "fb.com", "fb.me"],
  instagram: ["instagram."],
  tiktok: ["tiktok."],
  spotify: ["spotify."],
  appleMusic: ["music.apple.", "itunes.apple."],
  soundcloud: ["soundcloud."],
  bandcamp: ["bandcamp."],
};

/** True when empty (optional) or a parseable http(s) URL. */
export function isValidUrl(value: string | null | undefined): boolean {
  return validateUrl(value).ok;
}

export function validateUrl(
  value: string | null | undefined,
  label = "URL",
): UrlValidationResult {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return { ok: true };

  if (!URL.canParse(trimmed)) {
    return {
      ok: false,
      error: `${label}: "${trimmed}" is not a valid URL`,
    };
  }

  const url = new URL(trimmed);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return {
      ok: false,
      error: `${label}: "${trimmed}" must use http or https`,
    };
  }

  return { ok: true };
}

function matchesSocialPlatform(platform: SocialPlatform, url: string): boolean {
  if (platform === "website") return true;

  const lower = url.toLowerCase();
  if (lower.includes(platform.toLowerCase())) return true;

  return PLATFORM_HOST_HINTS[platform].some((hint) => lower.includes(hint));
}

export function validateSocialUrl(
  platform: SocialPlatform,
  value: string | null | undefined,
): UrlValidationResult {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return { ok: true };

  const format = validateUrl(trimmed, platform);
  if (!format.ok) {
    // Keep the platform-specific wording used by the edit API / tests
    return {
      ok: false,
      error: `${platform}: "${trimmed}" is not a valid ${platform} URL`,
    };
  }

  if (!matchesSocialPlatform(platform, trimmed)) {
    return {
      ok: false,
      error: `${platform}: "${trimmed}" is not a valid ${platform} URL`,
    };
  }

  return { ok: true };
}

/** Accepts either a plain string or `{ url }` social field objects. */
export function extractUrlValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (
    value &&
    typeof value === "object" &&
    "url" in value &&
    typeof (value as { url: unknown }).url === "string"
  ) {
    return (value as { url: string }).url;
  }
  return "";
}

export function validateSocialFields(
  data: Record<string, unknown>,
): UrlValidationResult {
  for (const platform of SOCIAL_PLATFORMS) {
    if (!(platform in data) || data[platform] === undefined) continue;
    const result = validateSocialUrl(platform, extractUrlValue(data[platform]));
    if (!result.ok) return result;
  }
  return { ok: true };
}

export { SOCIAL_PLATFORMS };
