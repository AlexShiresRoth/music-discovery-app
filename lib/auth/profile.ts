import { db } from "@/lib/db";
import { profilesSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import "server-only";
import { getSession } from "./session";

export async function getProfile() {
  try {
    const user = await getSession();

    if (!user) {
      return null;
    }

    const profile = await db
      .select()
      .from(profilesSchema)
      .where(eq(profilesSchema.userRefId, user.id))
      .limit(1);

    return profile[0] ?? null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}
