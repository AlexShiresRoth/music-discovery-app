/** Minimum time between feed-ranking `updatedAt` bumps. */
export const UPDATE_COOLDOWN_MS = 60 * 60 * 1000;

/**
 * Whether enough time has passed since the last feed bump.
 * Uses strict `>` so an update exactly one cooldown ago does not bump.
 */
export function canBumpUpdatedAt(
  lastUpdatedAt: Date | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!lastUpdatedAt) {
    return true;
  }
  return now.getTime() - lastUpdatedAt.getTime() > UPDATE_COOLDOWN_MS;
}

/**
 * Next `updatedAt` value for a profile update.
 * Returns a fresh date when the cooldown has passed; otherwise keeps the previous value.
 */
export function nextUpdatedAt(
  lastUpdatedAt: Date | null | undefined,
  now: Date = new Date(),
): Date {
  if (canBumpUpdatedAt(lastUpdatedAt, now)) {
    return now;
  }
  return lastUpdatedAt as Date;
}
