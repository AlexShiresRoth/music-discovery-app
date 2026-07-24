import { ilike, or } from "drizzle-orm";
import { db } from ".";
import { profilesSchema } from "./schema";

export async function searchProfiles(query: string, limit = 10) {
  return await db
    .select({
      id: profilesSchema.id,
      city: profilesSchema.city,
      fullName: profilesSchema.fullName,
      state: profilesSchema.state,
      country: profilesSchema.country,
    })
    .from(profilesSchema)
    .where(
      or(
        ilike(profilesSchema.city, `${query}%`),
        ilike(profilesSchema.profileName, `${query}%`),
      ),
    )
    .limit(limit);
}
