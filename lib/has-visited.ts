export const HAS_VISITED_COOKIE = "has-visited";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

export function hasVisitedFromCookie(
  value: string | undefined | null,
): boolean {
  return value === "true";
}

/** Client: persist visit so the next server render can omit the intro header. */
export function setHasVisited() {
  document.cookie = [
    `${HAS_VISITED_COOKIE}=true`,
    "path=/",
    `max-age=${MAX_AGE_SECONDS}`,
    "samesite=lax",
  ].join("; ");
  window.dispatchEvent(new Event(HAS_VISITED_COOKIE));
}

export function getHasVisitedCookieClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((row) => {
    const [name, value] = row.split("=");
    return name === HAS_VISITED_COOKIE && value === "true";
  });
}
