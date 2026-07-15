import { db } from "@/lib/db";
import { songClipsSchema } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import "server-only";

export async function getSongClipsByIds(clipIds: string[]) {
  if (clipIds.length === 0) {
    return [];
  }

  const ids = clipIds
    .map((id) => Number(id))
    .filter((id) => !Number.isNaN(id));

  if (ids.length === 0) {
    return [];
  }

  return db
    .select()
    .from(songClipsSchema)
    .where(inArray(songClipsSchema.id, ids));
}
