import { createAdminClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { profilesSchema, songClipsSchema } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import "server-only";

export type DeleteProfileResult =
  | { status: "deleted" }
  | { status: "not_found" }
  | { status: "error"; message: string };

/**
 * Deletes a user's profile row, related song clips, and clip storage objects.
 * Safe to call when no profile exists (`not_found`).
 */
export async function deleteProfileForUser(
  userId: string,
): Promise<DeleteProfileResult> {
  try {
    const admin = createAdminClient();
    const bucket = process.env.SONG_CLIPS_BUCKET_NAME || "";

    const [foundProfile] = await db
      .select()
      .from(profilesSchema)
      .where(eq(profilesSchema.userRefId, userId));

    if (!foundProfile) {
      return { status: "not_found" };
    }

    if (foundProfile.songClips.length > 0) {
      const clips = await db
        .select()
        .from(songClipsSchema)
        .where(
          inArray(
            songClipsSchema.id,
            foundProfile.songClips.map(
              (clip) => clip.id,
            ) as unknown as number[],
          ),
        );

      const storagePaths = clips
        .map((clip) => {
          const parts = clip.db_url?.split("/") || [];
          const indexOfClips = parts.indexOf("clips");

          return indexOfClips >= 0
            ? parts.slice(indexOfClips, parts.length).join("/")
            : undefined;
        })
        .filter(Boolean) as string[];

      if (storagePaths.length > 0) {
        const { error } = await admin.storage.from(bucket).remove(storagePaths);
        if (error) {
          console.error(error);
          return { status: "error", message: "Failed to delete clips" };
        }
      }

      await db.delete(songClipsSchema).where(
        inArray(
          songClipsSchema.id,
          clips.map((clip) => clip.id),
        ),
      );
    }

    await db
      .delete(profilesSchema)
      .where(eq(profilesSchema.userRefId, userId));

    return { status: "deleted" };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}
