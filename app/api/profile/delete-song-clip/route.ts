import { createAdminClient, createServerClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { profilesSchema, songClipsSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "process";

export async function DELETE(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clipId: rawClipId } = await request.json();

  if (rawClipId === undefined || rawClipId === null || rawClipId === "") {
    return NextResponse.json({ error: "Clip ID is required" }, { status: 400 });
  }

  const clipId = Number(rawClipId);

  if (!Number.isInteger(clipId) || clipId <= 0) {
    return NextResponse.json({ error: "Invalid clip ID" }, { status: 400 });
  }

  const profiles = await db
    .select()
    .from(profilesSchema)
    .where(eq(profilesSchema.userRefId, user.id))
    .limit(1);

  const profile = profiles[0];

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (!profile.isVerified) {
    return NextResponse.json(
      { error: "Account must be verified to delete song clips" },
      { status: 403 },
    );
  }

  const newClipIds = profile.songClips.filter(
    (clip) => Number(clip.id) !== clipId,
  );

  await db
    .update(profilesSchema)
    .set({ songClips: newClipIds })
    .where(eq(profilesSchema.userRefId, user.id));

  const clips = await db
    .select()
    .from(songClipsSchema)
    .where(eq(songClipsSchema.id, clipId))
    .limit(1);

  const clip = clips[0];

  if (!clip) {
    return NextResponse.json({ error: "Song clip not found" }, { status: 404 });
  }

  const safeName = clip.db_url?.split("/").pop() || "";

  const decodedName = decodeURIComponent(safeName);

  await db.delete(songClipsSchema).where(eq(songClipsSchema.id, clipId));

  const bucket = env.SONG_CLIPS_BUCKET_NAME || "";

  const adminClient = createAdminClient();

  const { error: deleteError } = await adminClient.storage
    .from(bucket)
    .remove([`clips/${user.id}/${decodedName}`]);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Song clip deleted successfully" },
    { status: 200 },
  );
}
