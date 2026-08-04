import { createAdminClient, createServerClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { profilesSchema, songClipsSchema } from "@/lib/db/schema";
import { SongClipWithSlot } from "@/lib/db/types";
import { nextUpdatedAt } from "@/lib/profile/update-cooldown";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "process";

export const runtime = "nodejs";

const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "audio/aac",
  "audio/ogg",
  "audio/webm",
]);

type ClipMetadata = {
  index: number;
  title: string;
  fullSongUrl: string;
  selectedRegion: { start: number; end: number } | null;
};

function isAllowedAudio(file: File) {
  return ALLOWED_AUDIO_TYPES.has(file.type) || file.type.startsWith("audio/");
}

export async function POST(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile] = await db
    .select()
    .from(profilesSchema)
    .where(eq(profilesSchema.userRefId, user.id))
    .limit(1);

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (!profile.isVerified) {
    return NextResponse.json(
      { error: "Account must be verified to upload song clips" },
      { status: 403 },
    );
  }
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const metadataEntry = formData.get("metadata") as string;

  if (!file) {
    return NextResponse.json({ error: "A file is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const bucket = env.SONG_CLIPS_BUCKET_NAME || "";
  const clipMap = new Map<number, SongClipWithSlot>();

  for (const clip of profile.songClips) {
    clipMap.set(clip.slot, clip);
  }

  let meta: ClipMetadata;
  try {
    meta = JSON.parse(metadataEntry) as ClipMetadata;
  } catch {
    return NextResponse.json(
      { error: "Invalid clip metadata" },
      { status: 400 },
    );
  }

  if (!isAllowedAudio(file)) {
    return NextResponse.json({ error: "Invalid audio file" }, { status: 400 });
  }

  const title = meta.title?.trim();
  if (!title) {
    return NextResponse.json(
      { error: `Title is required for ${file.name}` },
      { status: 400 },
    );
  }

  if (!meta.selectedRegion) {
    return NextResponse.json(
      { error: `Select a clip region for ${file.name}` },
      { status: 400 },
    );
  }

  try {
    const safeTitle = title.replace(/[/\\]/g, "_");
    const storagePath = `clips/${user.id}/${Date.now()}-${meta.index}-${safeTitle}`;

    const { error } = await admin.storage
      .from(bucket)
      .upload(storagePath, file, {
        upsert: true,
        contentType: "audio/mpeg",
      });

    if (error) {
      console.error(error.message);
      return NextResponse.json(
        { error: "Failed to upload audio file" },
        { status: 500 },
      );
    }

    const { data: urlData } = admin.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    const [clip] = await db
      .insert(songClipsSchema)
      .values({
        slot: meta.index,
        db_url: urlData.publicUrl,
        title,
        full_song_url: meta.fullSongUrl?.trim() || null,
      })
      .returning();

    clipMap.set(meta.index, { slot: clip.slot, id: String(clip.id) });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : `Failed to process ${file.name}`,
      },
      { status: 400 },
    );
  }

  await db
    .update(profilesSchema)
    .set({
      songClips: [...clipMap.values()],
      updatedAt: nextUpdatedAt(profile.updatedAt),
    })
    .where(eq(profilesSchema.userRefId, user.id));

  return NextResponse.json({
    success: true,
  });
}
