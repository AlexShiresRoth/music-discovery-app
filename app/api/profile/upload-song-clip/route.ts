import { trimAudio } from "@/lib/audio/song-clip-duration";
import { createAdminClient, createServerClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { profilesSchema, songClipsSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

function extensionForFile(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName !== file.name) {
    return fromName.toLowerCase();
  }

  if (file.type.includes("wav")) return "wav";
  if (file.type.includes("mp4") || file.type.includes("m4a")) return "m4a";
  if (file.type.includes("ogg")) return "ogg";
  if (file.type.includes("webm")) return "webm";
  return "mp3";
}

async function writeTempFile(file: File, suffix: string) {
  const path = join(tmpdir(), `clip-${randomUUID()}${suffix}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path, buffer);
  return path;
}

async function cleanup(...paths: Array<string | null>) {
  await Promise.all(
    paths.map(async (path) => {
      if (!path) return;
      try {
        await fs.unlink(path);
      } catch {
        // Ignore missing temp files.
      }
    }),
  );
}

// TODO - this works locally but not on Vercel/supabase. NEed to handle this
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
    return NextResponse.json(
      { error: "At least one file is required" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const bucket = env.SONG_CLIPS_BUCKET_NAME || "";
  const newClipIds = [...profile.songClips];

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

  const { start, end } = meta.selectedRegion;
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  console.log("meta", meta);

  try {
    inputPath = await writeTempFile(file, `.${extensionForFile(file)}`);
    outputPath = join(tmpdir(), `clip-trimmed-${randomUUID()}.mp3`);

    await trimAudio({
      inputPath,
      outputPath,
      start,
      end,
    });

    const trimmedBuffer = await fs.readFile(outputPath);
    const safeTitle = title.replace(/[/\\]/g, "_");
    const storagePath = `clips/${user.id}/${Date.now()}-${meta.index}-${safeTitle}.mp3`;

    const { error } = await admin.storage
      .from(bucket)
      .upload(storagePath, trimmedBuffer, {
        upsert: true,
        contentType: "audio/mpeg",
      });

    if (error) {
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

    newClipIds.push({ slot: meta.index, id: String(clip.id) });
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
  } finally {
    await cleanup(inputPath, outputPath);
  }

  await db
    .update(profilesSchema)
    .set({ songClips: newClipIds })
    .where(eq(profilesSchema.userRefId, user.id));

  return NextResponse.json({
    success: true,
  });
}
