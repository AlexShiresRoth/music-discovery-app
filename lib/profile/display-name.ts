import { db } from "@/lib/db";
import { profilesSchema } from "@/lib/db/schema";
import { and, ilike, ne } from "drizzle-orm";
import "server-only";

/**
 * Checks whether a display name is already taken by another profile (case-insensitive).
 *
 * @param profileName The display name to check
 * @param excludeUserId Optional userRefId to exclude (e.g. when an artist is updating their own profile)
 */
export async function isProfileNameTaken(
  profileName: string,
  excludeUserId?: string,
): Promise<boolean> {
  const trimmed = profileName.trim();
  if (!trimmed) {
    return false;
  }

  const conditions = [ilike(profilesSchema.profileName, trimmed)];
  if (excludeUserId) {
    conditions.push(ne(profilesSchema.userRefId, excludeUserId));
  }

  const existing = await db
    .select({ id: profilesSchema.id })
    .from(profilesSchema)
    .where(and(...conditions))
    .limit(1);

  return existing.length > 0;
}
