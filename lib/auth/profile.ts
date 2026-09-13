import { PROFILE_STATUS_FILTERS, type ProfileStatusField } from "@/constants";
import { db } from "@/lib/db";
import { profilesSchema } from "@/lib/db/schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { cache } from "react";
import "server-only";
import { getSongClipsByIds } from "../db/song-clips";
import { ProfileWithSongClips } from "../db/types";
import { getSession } from "./session";

/** Discovery/list queries only return profiles marked public. */
const isPublic = eq(profilesSchema.public, true);

const STATUS_COLUMNS = {
  openToCollaboration: profilesSchema.openToCollaboration,
  openToGigs: profilesSchema.openToGigs,
  needActForShow: profilesSchema.needActForShow,
} as const satisfies Record<ProfileStatusField, unknown>;

/** Match profiles that have any of the selected status flags (OR). */
function statusMatchCondition(status: string[]): SQL | undefined {
  const conditions = (
    Object.keys(PROFILE_STATUS_FILTERS) as ProfileStatusField[]
  )
    .filter((field) => status.includes(PROFILE_STATUS_FILTERS[field].value))
    .map((field) => eq(STATUS_COLUMNS[field], true));

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return or(...conditions);
}

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

export const getProfileById = cache(async (id: string) => {
  try {
    const [profile] = await db
      .select()
      .from(profilesSchema)
      .where(eq(profilesSchema.id, Number(id)));

    if (!profile) {
      return null;
    }

    // Hidden profiles are only visible to their owner.
    if (!profile.public) {
      const user = await getSession();
      if (!user || user.id !== profile.userRefId) {
        return null;
      }
    }

    const songClips = await getSongClipsByIds(
      profile.songClips.map((clip) => clip.id),
    );

    return { ...profile, songClips };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
});

/** Lightweight rows for sitemap generation (public profile URLs). */
export async function getPublicProfilesForSitemap() {
  try {
    return await db
      .select({
        id: profilesSchema.id,
        updatedAt: profilesSchema.updatedAt,
        imageUrl: profilesSchema.imageUrl,
      })
      .from(profilesSchema)
      .where(isPublic)
      .orderBy(desc(profilesSchema.updatedAt));
  } catch (error) {
    console.error("Error fetching profiles for sitemap:", error);
    return [];
  }
}

export async function getProfilesWithSongClips(
  startIndex: number = 0,
  limit: number = 15,
  status: string[] = [],
): Promise<ProfileWithSongClips[]> {
  try {
    const statusCondition = statusMatchCondition(status);
    const profiles = await db
      .select()
      .from(profilesSchema)
      .where(
        and(
          isPublic,
          sql`jsonb_array_length(${profilesSchema.songClips}) > 0`,
          statusCondition,
        ),
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

export async function getTotalProfilesWithSongClips(
  status: string[] = [],
): Promise<number> {
  try {
    const statusCondition = statusMatchCondition(status);
    const totalProfiles = await db
      .select({ count: count() })
      .from(profilesSchema)
      .where(
        and(
          isPublic,
          sql`jsonb_array_length(${profilesSchema.songClips}) > 0`,
          statusCondition,
        ),
      );
    return totalProfiles[0].count;
  } catch (error) {
    console.error("Error fetching total profiles:", error);
    return 0;
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
      .where(and(isPublic, ilike(profilesSchema.profileName, `${query}%`)))
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
      .where(
        and(
          isPublic,
          ilike(profilesSchema.genre, `${query}%`),
          sql`jsonb_array_length(${profilesSchema.songClips}) > 0`,
        ),
      )
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
  status: string[] = [],
  startIndex: number = 0,
  limit: number = 15,
): Promise<ProfileWithSongClips[]> {
  try {
    const statusCondition = statusMatchCondition(status);
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
        and(
          isPublic,
          statusCondition,
          sql`ST_DWithin(${profilesSchema.location}, ${searchPoint}, ${RADIUS})`,
          sql`jsonb_array_length(${profilesSchema.songClips}) > 0`,
        ),
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

export async function getTotalProfilesWithSongClipsByLocation(
  longitude: number,
  latitude: number,
  status: string[] = [],
): Promise<number> {
  try {
    const statusCondition = statusMatchCondition(status);
    const searchPoint = sql`
    ST_SetSRID(
      ST_MakePoint(${longitude}, ${latitude}),
      4326
    )::geography
  `;

    const RADIUS = 40_000;

    const totalProfiles = await db
      .select({ count: count() })
      .from(profilesSchema)
      .where(
        and(
          isPublic,
          statusCondition,
          sql`ST_DWithin(${profilesSchema.location}, ${searchPoint}, ${RADIUS})`,
          sql`jsonb_array_length(${profilesSchema.songClips}) > 0`,
        ),
      );

    return totalProfiles[0].count;
  } catch (error) {
    console.error("Error fetching total profiles:", error);
    return 0;
  }
}
