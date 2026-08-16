import { and, eq, ilike, or } from "drizzle-orm";
import { db } from ".";
import { profilesSchema } from "./schema";

const isPublic = eq(profilesSchema.public, true);

export async function searchProfiles(query: string, limit = 10) {
  return await db
    .select({
      id: profilesSchema.id,
      profileName: profilesSchema.profileName,
    })
    .from(profilesSchema)
    .where(and(isPublic, or(ilike(profilesSchema.profileName, `${query}%`))))
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
    .where(and(isPublic, ilike(profilesSchema.city, `${query}%`)))
    .limit(limit);
}
