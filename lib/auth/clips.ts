import { and, desc, eq, inArray } from "drizzle-orm";
import "server-only";
import { db } from "../db";
import { profilesSchema, songClipsSchema } from "../db/schema";
import { SongClipWithProfile } from "../db/types";

export async function getSongClips(genres?: string[], limit = 15) {
  try {
    const songClips = await db
      .select()
      .from(songClipsSchema)
      .where(
        genres ? inArray(songClipsSchema.genre, genres as string[]) : undefined,
      )
      .orderBy(desc(songClipsSchema.updatedAt))
      .limit(limit);

    const songClipsWithProfiles = (
      await Promise.all(
        songClips.map(async (clip) => {
          const [profile] = await db
            .select()
            .from(profilesSchema)
            .where(
              and(
                eq(profilesSchema.id, clip.profileRefId),
                eq(profilesSchema.public, true),
              ),
            );
          if (!profile) {
            return null;
          }
          return {
            ...clip,
            profileId: profile.id,
            profileName: profile.profileName,
            profileImage: profile.imageUrl,
          };
        }),
      )
    ).filter((clip) => clip !== null) as SongClipWithProfile[];

    return songClipsWithProfiles;
  } catch (error) {
    console.error("Error fetching song clips:", error);
    return [];
  }
}
