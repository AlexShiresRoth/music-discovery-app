import { createAdminClient, createServerClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { profilesSchema, songClipsSchema } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "process";

const admin = createAdminClient();
const bucket = env.SONG_CLIPS_BUCKET_NAME || "";
export async function DELETE() {
  try {
    const supabse = await createServerClient();

    const {
      data: { user },
    } = await supabse.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [foundProfile] = await db
      .select()
      .from(profilesSchema)
      .where(eq(profilesSchema.userRefId, user.id));

    if (!foundProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // only need to delete clips if they exist
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

      const { error } = await admin.storage.from(bucket).remove(storagePaths);

      if (error) {
        console.error(error);
        return NextResponse.json(
          { error: "Failed to delete clips" },
          { status: 500 },
        );
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
      .where(eq(profilesSchema.userRefId, user.id));

    return NextResponse.json({ message: "Profile deleted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
