const NEW_THRESHOLD_MS = 5 * 60 * 60 * 1000;

export type PublishedAt = {
  label: string;
  isNew: boolean;
};

/** Formats a past date as a short relative phrase, e.g. "3 days ago". */
export function formatRelativeTime(
  value: Date | string | number | null | undefined,
  now = Date.now(),
): string | null {
  if (value == null) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const diffMs = Math.max(0, now - date.getTime());
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }

  const years = Math.floor(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

export function formatPublishedAt(
  value: Date | string | number | null | undefined,
  now = Date.now(),
): PublishedAt | null {
  if (value == null) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const relative = formatRelativeTime(date, now);
  if (!relative) return null;

  const diffMs = Math.max(0, now - date.getTime());
  return {
    label: `Published ${relative}`,
    isNew: diffMs < NEW_THRESHOLD_MS,
  };
}
