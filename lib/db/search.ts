import { ilike, or } from "drizzle-orm";
import { db } from ".";
import { profilesSchema } from "./schema";

export async function searchProfiles(query: string, limit = 10) {
  return await db
    .select({
      id: profilesSchema.id,
      profileName: profilesSchema.profileName,
    })
    .from(profilesSchema)
    .where(or(ilike(profilesSchema.profileName, `${query}%`)))
    .limit(limit);
}

export async function searchCities(query: string, limit = 10) {
  return await db
    .select({
      id: profilesSchema.id,
      city: profilesSchema.city,
      lat: profilesSchema.lat,
      lon: profilesSchema.lon,
    })
    .from(profilesSchema)
    .where(ilike(profilesSchema.city, `${query}%`))
    .limit(limit);
}
