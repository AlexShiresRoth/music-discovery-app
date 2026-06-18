import { eq } from "drizzle-orm";
import { db } from "../db";
import { listenerProfilesSchema } from "../db/schema";
import { getSession } from "./session";

/**
 *
 * @returns The listener profile for the current user
 * @description returns a singular profile for the current user
 */
export async function getListenerProfile() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const profile = await db
    .select()
    .from(listenerProfilesSchema)
    .where(eq(listenerProfilesSchema.userIdRef, session.user.id));

  return profile?.[0];
}
