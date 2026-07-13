import { createAdminClient, createServerClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { profilesSchema, songClipsSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "process";

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
  const files = formData.getAll("files") as File[];
  const metadata = formData.getAll("metadata") as string[];

  console.log("files", files);
  console.log("metadata", metadata);
  if (files.length === 0) {
    return NextResponse.json(
      { error: "At least one file is required" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const bucket = env.SONG_CLIPS_BUCKET_NAME || "";
  const uploadedClips = [];
  const newClipIds = [...profile.songClips];

  for await (const file of files) {
    console.log("file", file);
    if (!isAllowedAudio(file)) {
      return NextResponse.json(
        { error: "Invalid audio file" },
        { status: 400 },
      );
    }

    const safeName = file.name.replace(/[/\\]/g, "_");

    const { error, data } = await admin.storage
      .from(bucket)
      .upload(`clips/${user.id}/${safeName}`, file, { upsert: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to upload audio file" },
        { status: 500 },
      );
    }

    const clip = await db
      .insert(songClipsSchema)
      .values([
        {
          db_url: data.fullPath,
          title: file.title,
          full_song_url: file.fullSongUrl,
          slot: file.slot,
        },
      ])
      .returning();

    newClipIds.push(clip[0]?.id.toString());
  }

  return NextResponse.json({
    success: true,
  });
}
