import { db } from "@/lib/db";
import { artistProfilesSchema } from "@/lib/db/schema";
import { arrayContains } from "drizzle-orm";
import "server-only";
import { getSession } from "./session";

export async function getArtistProfile() {
  try {
    const user = await getSession();

    if (!user) {
      return null;
    }

    const profile = await db
      .select()
      .from(artistProfilesSchema)
      .where(arrayContains(artistProfilesSchema.membersWithAccess, [user.id]))
      .limit(1);

    return profile[0] ?? null;
  } catch (error) {
    console.error("Error fetching artist profile:", error);
    return null;
  }
}
