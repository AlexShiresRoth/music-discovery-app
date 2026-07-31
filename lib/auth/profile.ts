import { db } from "@/lib/db";
import { profilesSchema } from "@/lib/db/schema";
import { and, asc, desc, eq, ilike, inArray, sql } from "drizzle-orm";
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

export async function getProfilesWithSongClips(
  startIndex: number = 0,
  limit: number = 15,
  genres: string[] = [],
): Promise<ProfileWithSongClips[]> {
  try {
    const profiles = await db
      .select()
      .from(profilesSchema)
      .where(
        genres.length > 0
          ? and(
              inArray(profilesSchema.genre, genres),
              sql`jsonb_array_length(${profilesSchema.songClips}) > 0`,
            )
          : sql`jsonb_array_length(${profilesSchema.songClips}) > 0`,
      )
      .orderBy(desc(profilesSchema.updatedAt))
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
  genres: string[] = [],
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

    const RADIUS = 40_000;

    const profiles = await db
      .select()
      .from(profilesSchema)
      .where(
        genres.length > 0
          ? and(
              inArray(profilesSchema.genre, genres),
              sql`ST_DWithin(${profilesSchema.location}, ${searchPoint}, ${RADIUS})`,
            )
          : sql`ST_DWithin(${profilesSchema.location}, ${searchPoint}, ${RADIUS})`,
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
