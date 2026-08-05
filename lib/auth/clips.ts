import { desc, eq, inArray } from "drizzle-orm";
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

    return (await Promise.all(
      songClips.map(async (clip) => {
        const profile = await db
          .select()
          .from(profilesSchema)
          .where(eq(profilesSchema.id, clip.profileRefId));
        return {
          ...clip,
          profileId: profile[0].id,
          profileName: profile[0].profileName,
          profileImage: profile[0].imageUrl,
        };
      }),
    )) as SongClipWithProfile[];
  } catch (error) {
    console.error("Error fetching song clips:", error);
    return [];
  }
}
