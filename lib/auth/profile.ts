import { db } from "@/lib/db";
import { profilesSchema } from "@/lib/db/schema";
import { and, asc, eq, ilike, sql } from "drizzle-orm";
import "server-only";
import { getSongClipsByIds } from "../db/song-clips";
import { ProfileWithSongClips } from "../db/types";
import { getSession } from "./session";

export async function getProfile() {
  try {
    const user = await getSession();

    if (!user) {
      return null;
    }

    const [profile] = await db
      .select()
      .from(profilesSchema)
      .where(eq(profilesSchema.userRefId, user.id))
      .limit(1);

    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function getProfileById(id: string) {
  try {
    const [profile] = await db
      .select()
      .from(profilesSchema)
      .where(eq(profilesSchema.id, Number(id)));

    if (!profile) {
      return null;
    }

    const songClips = await getSongClipsByIds(
      profile.songClips.map((clip) => clip.id),
    );

    const profileWithSongClips = { ...profile, songClips };

    return profileWithSongClips;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

// TODO - we should shuffle the profiles
export async function getProfilesWithSongClips(
  startIndex: number = 0,
  limit: number = 15,
  genre?: string,
): Promise<ProfileWithSongClips[]> {
  try {
    const profiles = await db
      .select()
      .from(profilesSchema)
      .where(genre ? eq(profilesSchema.genre, genre) : undefined)
      .offset(startIndex)
      .limit(limit);

    if (profiles.length === 0) {
      return [];
    }

    return await Promise.all(
      profiles.map(async (profile) => {
        const songClips = await getSongClipsByIds(
          profile.songClips.map((clip) => clip.id),
        );
        return { ...profile, songClips };
      }),
    );
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
}

export async function getProfilesWithSongClipsByQuery(
  query: string,
  startIndex: number = 0,
  limit: number = 15,
): Promise<ProfileWithSongClips[]> {
  try {
    const profiles = await db
      .select()
      .from(profilesSchema)
      .where(ilike(profilesSchema.profileName, `${query}%`))
      .offset(startIndex)
      .limit(limit);
    if (profiles.length === 0) {
      return [];
    }

    return await Promise.all(
      profiles.map(async (profile) => {
        const songClips = await getSongClipsByIds(
          profile.songClips.map((clip) => clip.id),
        );
        return { ...profile, songClips };
      }),
    );
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
}

export async function getProfilesWithSongClipsByGenre(
  query: string,
  startIndex: number = 0,
  limit: number = 15,
): Promise<ProfileWithSongClips[]> {
  try {
    const profiles = await db
      .select()
      .from(profilesSchema)
      .where(ilike(profilesSchema.genre, `${query}%`))
      .offset(startIndex)
      .limit(limit);

    if (profiles.length === 0) {
      return [];
    }

    return await Promise.all(
      profiles.map(async (profile) => {
        const songClips = await getSongClipsByIds(
          profile.songClips.map((clip) => clip.id),
        );
        return { ...profile, songClips };
      }),
    );
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
}

export async function getProfilesWithSongClipsByLocation(
  longitude: number,
  latitude: number,
  genre?: string,
  startIndex: number = 0,
  limit: number = 15,
): Promise<ProfileWithSongClips[]> {
  try {
    const searchPoint = sql`
    ST_SetSRID(
      ST_MakePoint(${longitude}, ${latitude}),
      4326
    )::geography
  `;

    const distance = sql<number>`
    ST_Distance(${profilesSchema.location}, ${searchPoint})
  `;

    const profiles = await db
      .select()
      .from(profilesSchema)
      .where(
        genre
          ? and(
              eq(profilesSchema.genre, genre),
              sql`ST_DWithin(${profilesSchema.location}, ${searchPoint}, 40_000)`,
            )
          : sql`ST_DWithin(${profilesSchema.location}, ${searchPoint}, 40_000)`,
      )
      .orderBy(asc(distance))
      .offset(startIndex)
      .limit(limit);

    if (profiles.length === 0) {
      return [];
    }

    return await Promise.all(
      profiles.map(async (profile) => {
        const songClips = await getSongClipsByIds(
          profile.songClips.map((clip) => clip.id),
        );
        return { ...profile, songClips };
      }),
    );
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
}
