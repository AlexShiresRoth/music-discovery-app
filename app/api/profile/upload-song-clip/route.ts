import { MAX_SONG_CLIPS } from "@/app/profile/schemas";
import { createAdminClient, createServerClient } from "@/lib/auth";
import { validateClipDuration } from "@/lib/audio/validate-clip-duration.server";
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
  const titles = formData.getAll("titles") as string[];
  const fullSongUrls = formData.getAll("fullSongUrls") as string[];

  if (files.length === 0) {
    return NextResponse.json(
      { error: "At least one file is required" },
      { status: 400 },
    );
  }

  if (files.length !== titles.length || files.length !== fullSongUrls.length) {
    return NextResponse.json(
      { error: "Each file must have a matching title and URL fields" },
      { status: 400 },
    );
  }

  if (profile.songClips.length + files.length > MAX_SONG_CLIPS) {
    return NextResponse.json(
      {
        error: `You can only have up to ${MAX_SONG_CLIPS} song clips (${profile.songClips.length} already uploaded)`,
      },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const bucket = env.SONG_CLIPS_BUCKET_NAME || "";
  const uploadedClips = [];
  const newClipIds = [...profile.songClips];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const title = titles[i]?.trim();
    const fullSongUrl = fullSongUrls[i]?.trim();

    if (!title) {
      return NextResponse.json(
        { error: `Title is required for file: ${file.name}` },
        { status: 400 },
      );
    }

    if (!isAllowedAudio(file)) {
      return NextResponse.json(
        { error: `${file.name} must be an audio format (mp3, wav, m4a, etc.)` },
        { status: 400 },
      );
    }

    const durationCheck = await validateClipDuration(file);
    if (!durationCheck.valid) {
      return NextResponse.json({ error: durationCheck.error }, { status: 400 });
    }

    const safeName = file.name.replace(/[/\\]/g, "_");
    const storagePath = `clips/${user.id}/${Date.now()}-${i}-${safeName}`;

    const { error: uploadError } = await admin.storage
      .from(bucket)
      .upload(storagePath, file, { upsert: true });

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json(
        { error: `Failed to upload ${file.name}: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data: urlData } = admin.storage.from(bucket).getPublicUrl(storagePath);

    const [clip] = await db
      .insert(songClipsSchema)
      .values({
        title,
        db_url: urlData.publicUrl,
        full_song_url: fullSongUrl || null,
      })
      .returning();

    uploadedClips.push(clip);
    newClipIds.push(String(clip.id));
  }

  await db
    .update(profilesSchema)
    .set({ songClips: newClipIds })
    .where(eq(profilesSchema.userRefId, user.id));

  return NextResponse.json({
    success: true,
    clips: uploadedClips,
    count: uploadedClips.length,
  });
}
